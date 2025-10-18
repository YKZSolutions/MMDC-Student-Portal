import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { AssignmentSubmissionDetailsDto } from './dto/paginated-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { UpdateAssignmentSubmissionDto } from '@/generated/nestjs-dto/update-assignmentSubmission.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { isUUID } from 'class-validator';
import { CreateAssignmentSubmissionDto } from '@/generated/nestjs-dto/create-assignmentSubmission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly notificationService: NotificationsService,
  ) {}

  async grade(
    id: string,
    gradeDto: GradeSubmissionDto,
  ): Promise<GradeRecordDto> {
    const grade = await this.prisma.client.gradeRecord.upsert({
      where: { studentId: gradeDto.studentId, assignmentSubmissionId: id },
      create: {
        studentId: gradeDto.studentId,
        assignmentSubmissionId: id,
        rawScore: gradeDto.grade,
        finalScore: gradeDto.grade,
        grade: 'Pass',
      },
      update: {
        rawScore: gradeDto.grade,
        finalScore: gradeDto.grade,
        grade: 'Pass',
      },
      include: {
        assignmentSubmission: {
          select: {
            assignment: {
              select: {
                moduleContent: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await this.notificationService.notifyUser(
      gradeDto.studentId,
      'Submission Graded',
      `Your ${grade.assignmentSubmission?.assignment?.moduleContent?.title} submission has been graded`,
    );

    return grade;
  }

  @Log({
    logArgsMessage: ({ moduleContentId, studentId }) =>
      `Creating assignment submission for assignment ${moduleContentId} and student ${studentId}`,
    logSuccessMessage: (submission) =>
      `Assignment submission [${submission.id}] successfully created.`,
    logErrorMessage: (err, { moduleContentId, studentId }) =>
      `Error creating assignment submission for assignment ${moduleContentId} and student ${studentId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Submission already exists for this assignment and student.',
      ),
  })
  async createAssignmentSubmission(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('dto') dto: CreateAssignmentSubmissionDto,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(moduleContentId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid assignment or student ID format');
    }
    const submission = await this.prisma.client.assignmentSubmission.create({
      data: {
        ...dto,
        assignment: { connect: { moduleContentId } },
        student: { connect: { id: studentId } },
        content: dto.content as Prisma.JsonArray,
      },
    });
    return {
      ...submission,
      content: submission.content as Prisma.JsonArray,
      groupSnapshot: submission.groupSnapshot as Prisma.JsonArray,
    };
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
  async updateAssignmentSubmission(
    @LogParam('id') id: string,
    @LogParam('dto') dto: UpdateAssignmentSubmissionDto,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    const submission = await this.prisma.client.assignmentSubmission.update({
      where: { id },
      data: {
        ...dto,
        content: dto.content as Prisma.JsonArray,
      },
    });
    return {
      ...submission,
      content: submission.content as Prisma.JsonArray,
      groupSnapshot: submission.groupSnapshot as Prisma.JsonArray,
    };
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
  async findById(
    @LogParam('id') id: string,
  ): Promise<AssignmentSubmissionDetailsDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    const result =
      await this.prisma.client.assignmentSubmission.findUniqueOrThrow({
        where: { id },
        include: {
          gradeRecord: true,
          student: true,
          attachments: true,
          assignment: true,
        },
      });
    return {
      ...result,
      content: result.content as Prisma.JsonArray,
      groupSnapshot: result.groupSnapshot as Prisma.JsonArray,
    };
  }

  @Log({
    logArgsMessage: ({ moduleContentId, studentId }) =>
      `Fetching assignment submissions for assignment ${moduleContentId} and student ${studentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} assignment submissions.`,
    logErrorMessage: (err, { moduleContentId, studentId }) =>
      `Error fetching assignment submissions for assignment ${moduleContentId} and student ${studentId}: ${err.message}`,
  })
  async findByAssignmentAndStudent(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('studentId') studentId: string,
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    if (!isUUID(moduleContentId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid assignment or student ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { assignment: { moduleContentId }, studentId },
      include: {
        gradeRecord: true,
        student: true,
        attachments: true,
        assignment: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonArray,
      groupSnapshot: r.groupSnapshot as Prisma.JsonArray,
    }));
  }

  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Fetching all submissions for assignment ${moduleContentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} submissions for assignment.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Error fetching submissions for assignment ${moduleContentId}: ${err.message}`,
  })
  async findByAssignment(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid assignment ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { assignment: { moduleContentId } },
      include: {
        gradeRecord: true,
        student: true,
        attachments: true,
        assignment: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonArray,
      groupSnapshot: r.groupSnapshot as Prisma.JsonArray,
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
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    if (!isUUID(studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }
    const results = await this.prisma.client.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        gradeRecord: true,
        student: true,
        attachments: true,
        assignment: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      content: r.content as Prisma.JsonArray,
      groupSnapshot: r.groupSnapshot as Prisma.JsonArray,
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
  async removeAssignmentSubmission(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
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
}
