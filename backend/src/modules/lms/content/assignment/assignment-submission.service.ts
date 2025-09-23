import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { UpdateAssignmentSubmissionDto } from '@/generated/nestjs-dto/update-assignmentSubmission.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { AssignmentSubmission } from '@/generated/nestjs-dto/assignmentSubmission.entity';
import { isUUID } from 'class-validator';
import {
  Prisma,
  SubmissionState,
  AssignmentSubmission as PrismaAssignmentSubmission,
  Assignment as PrismaAssignment,
} from '@prisma/client';
import { SubmitAssignmentDto } from '@/modules/lms/dto/submit-assignment.dto';

@Injectable()
export class AssignmentSubmissionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ assignmentId, studentId }) =>
      `Creating assignment submission for assignment ${assignmentId} and student ${studentId}`,
    logSuccessMessage: (submission) =>
      `Assignment submission [${submission.id}] successfully created.`,
    logErrorMessage: (err, { assignmentId, studentId }) =>
      `Error creating assignment submission for assignment ${assignmentId} and student ${studentId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Submission already exists for this assignment and student.',
      ),
  })
  async create(
    @LogParam('assignmentId') assignmentId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('dto') dto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(assignmentId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid assignment or student ID format');
    }

    // Validate assignment exists and get settings
    const assignment = await this.prisma.client.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        moduleContent: { include: { module: { include: { course: true } } } },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validate group submission if groupId provided
    if (dto.groupSnapshot) {
      if (assignment.mode !== 'GROUP') {
        throw new BadRequestException(
          'This assignment does not allow group submissions',
        );
      }

      await this.validateGroupMembership(dto.groupSnapshot.id, studentId);
    } else if (assignment.mode === 'GROUP') {
      throw new BadRequestException(
        'This assignment requires group submission',
      );
    }

    // Set default state to DRAFT if not provided
    const submissionData = {
      ...dto,
      assignmentId,
      studentId,
      state: dto.state || SubmissionState.DRAFT,
      content: dto.content as Prisma.JsonValue,
      groupSnapshot: dto.groupSnapshot
        ? (JSON.parse(JSON.stringify(dto.groupSnapshot)) as Prisma.JsonValue)
        : null,
    };

    const submission = await this.prisma.client.assignmentSubmission.create({
      data: submissionData,
    });

    return this.mapSubmission(submission);
  }

  @Log({
    logArgsMessage: ({ id }) => `Finalizing assignment submission ${id}`,
    logSuccessMessage: (submission) =>
      `Assignment submission [${submission.id}] successfully finalized.`,
    logErrorMessage: (err, { id }) =>
      `Error finalizing assignment submission ${id}: ${err.message}`,
  })
  async finalizeSubmission(
    @LogParam('id') id: string,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }

    const existing = await this.prisma.client.assignmentSubmission.findUnique({
      where: { id },
      include: { assignment: true, attachments: true },
    });

    if (!existing) {
      throw new NotFoundException('Assignment submission not found');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException('Only draft submissions can be finalized');
    }

    // Validate submission has content
    if (!existing.content && existing.attachments.length === 0) {
      throw new BadRequestException(
        'Submission must have content or attachments',
      );
    }

    // Validate attempt limit
    await this.validateAttemptLimit(existing.assignmentId, existing.studentId);

    // Validate deadline and calculate late submission
    const lateStatus = this.validateDeadline(
      existing.assignment,
      true, // isFinalSubmission
    );

    const submission = await this.prisma.client.assignmentSubmission.update({
      where: { id },
      data: {
        state: SubmissionState.SUBMITTED,
        submittedAt: new Date(),
        lateDays: lateStatus.isLate ? lateStatus.lateDays : null,
        attemptNumber: await this.calculateAttemptNumber(
          existing.assignmentId,
          existing.studentId,
        ),
      },
    });

    return this.mapSubmission(submission);
  }

  @Log({
    logArgsMessage: ({ id }) => `Updating assignment submission ${id}`,
    logSuccessMessage: (submission) =>
      `Assignment submission [${submission.id}] successfully updated.`,
    logErrorMessage: (err, { id }) =>
      `Error updating assignment submission ${id}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Assignment submission not found'),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') dto: UpdateAssignmentSubmissionDto,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }

    // Check if submission can be modified
    const existing = await this.prisma.client.assignmentSubmission.findUnique({
      where: { id },
      include: { assignment: true, gradeRecord: true },
    });

    if (!existing) {
      throw new NotFoundException('Assignment submission not found');
    }

    if (existing.gradeRecord) {
      throw new ForbiddenException('Cannot modify graded submission');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException('Can only modify draft submissions');
    }

    const submission = await this.prisma.client.assignmentSubmission.update({
      where: { id },
      data: {
        ...dto,
        content: dto.content as Prisma.JsonValue,
      },
    });

    return this.mapSubmission(submission);
  }

  @Log({
    logArgsMessage: ({ id }) => `Fetching assignment submission ${id}`,
    logSuccessMessage: (submission) =>
      `Assignment submission [${submission.id}] successfully fetched.`,
    logErrorMessage: (err, { id }) =>
      `Error fetching assignment submission ${id}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Assignment submission not found'),
  })
  async findById(@LogParam('id') id: string): Promise<AssignmentSubmission> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    const result =
      await this.prisma.client.assignmentSubmission.findUniqueOrThrow({
        where: { id },
        include: { attachments: true },
      });
    return this.mapSubmission(result);
  }

  @Log({
    logArgsMessage: ({ assignmentId, studentId }) =>
      `Fetching assignment submissions for assignment ${assignmentId} and student ${studentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} assignment submissions.`,
    logErrorMessage: (err, { assignmentId, studentId }) =>
      `Error fetching assignment submissions for assignment ${assignmentId} and student ${studentId}: ${err.message}`,
  })
  async findByAssignmentAndStudent(
    @LogParam('assignmentId') assignmentId: string,
    @LogParam('studentId') studentId: string,
  ): Promise<AssignmentSubmission[]> {
    if (!isUUID(assignmentId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid assignment or student ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { assignmentId, studentId },
      include: { attachments: true },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonValue,
      groupSnapshot: r.groupSnapshot as Prisma.JsonValue,
    }));
  }

  @Log({
    logArgsMessage: ({ assignmentId }) =>
      `Fetching all submissions for assignment ${assignmentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} submissions for assignment.`,
    logErrorMessage: (err, { assignmentId }) =>
      `Error fetching submissions for assignment ${assignmentId}: ${err.message}`,
  })
  async findByAssignment(
    @LogParam('assignmentId') assignmentId: string,
  ): Promise<AssignmentSubmission[]> {
    if (!isUUID(assignmentId)) {
      throw new BadRequestException('Invalid assignment ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { assignmentId },
      include: { attachments: true },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonValue,
      groupSnapshot: r.groupSnapshot as Prisma.JsonValue,
    }));
  }

  @Log({
    logArgsMessage: ({ studentId }) =>
      `Fetching all assignment submissions for student ${studentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} assignment submissions for student.`,
    logErrorMessage: (err, { studentId }) =>
      `Error fetching assignment submissions for student ${studentId}: ${err.message}`,
  })
  async findByStudent(
    @LogParam('studentId') studentId: string,
  ): Promise<AssignmentSubmission[]> {
    if (!isUUID(studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { studentId },
      include: { attachments: true },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonValue,
      groupSnapshot: r.groupSnapshot as Prisma.JsonValue,
    }));
  }

  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing assignment submission ${id} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { id, directDelete }) =>
      directDelete
        ? `Assignment submission ${id} hard deleted.`
        : `Assignment submission ${id} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { id, directDelete }) =>
      `Error removing assignment submission ${id} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }

    // Check if submission can be deleted
    const existing = await this.prisma.client.assignmentSubmission.findUnique({
      where: { id },
      include: { gradeRecord: true },
    });

    if (!existing) {
      throw new NotFoundException('Assignment submission not found');
    }

    if (existing.gradeRecord) {
      throw new ForbiddenException('Cannot delete graded submission');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException('Can only delete draft submissions');
    }

    if (directDelete) {
      await this.prisma.client.assignmentSubmission.delete({ where: { id } });
    } else {
      await this.prisma.client.assignmentSubmission.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }
  }

  private async validateGroupMembership(groupId: string, studentId: string) {
    const groupMembership = await this.prisma.client.groupMember.findFirst({
      where: {
        groupId,
        studentId,
      },
      include: { student: true },
    });

    if (!groupMembership) {
      throw new BadRequestException(
        'Student is not a member of the specified group',
      );
    }
  }

  private async validateAttemptLimit(
    assignmentId: string,
    studentId: string,
  ): Promise<void> {
    const assignment = await this.prisma.client.assignment.findUnique({
      where: { id: assignmentId },
      select: { maxAttempts: true },
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    const previousSubmissions =
      await this.prisma.client.assignmentSubmission.count({
        where: {
          assignmentId,
          studentId,
          state: SubmissionState.SUBMITTED,
        },
      });

    if (
      assignment.maxAttempts > 0 &&
      previousSubmissions >= assignment.maxAttempts
    ) {
      throw new ConflictException(
        `Maximum submission attempts (${assignment.maxAttempts}) exceeded`,
      );
    }
  }

  private validateDeadline(
    assignment: PrismaAssignment,
    isFinalSubmission: boolean,
  ): { isLate: boolean; lateDays?: number; penalty?: number } {
    if (!isFinalSubmission) {
      return { isLate: false };
    }

    const now = new Date();

    if (!assignment.dueDate) {
      return { isLate: false };
    }

    if (now <= assignment.dueDate) {
      return { isLate: false };
    }

    if (!assignment.allowLateSubmission) {
      throw new BadRequestException(
        'Late submissions are not allowed for this assignment',
      );
    }

    const lateDays = Math.ceil(
      (now.getTime() - assignment.dueDate.getTime()) / (1000 * 3600 * 24),
    );
    const penalty = assignment.latePenalty
      ? lateDays * Number(assignment.latePenalty)
      : 0;

    return { isLate: true, lateDays, penalty };
  }

  private async calculateAttemptNumber(
    assignmentId: string,
    studentId: string,
  ): Promise<number> {
    const previousAttempts =
      await this.prisma.client.assignmentSubmission.count({
        where: {
          assignmentId,
          studentId,
          state: SubmissionState.SUBMITTED,
        },
      });

    return previousAttempts + 1;
  }

  private mapSubmission(
    submission: PrismaAssignmentSubmission,
  ): AssignmentSubmission {
    return {
      ...submission,
      content: submission.content as Prisma.JsonValue,
      groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
    };
  }
}
