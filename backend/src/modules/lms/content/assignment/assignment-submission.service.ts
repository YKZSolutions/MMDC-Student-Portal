import {
  BadRequestException,
  ConflictException,
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
import { CreateAssignmentSubmissionDto } from '@/generated/nestjs-dto/create-assignmentSubmission.dto';
import { UpdateAssignmentSubmissionDto } from '@/generated/nestjs-dto/update-assignmentSubmission.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { AssignmentSubmission } from '@/generated/nestjs-dto/assignmentSubmission.entity';
import { isUUID } from 'class-validator';
import { Prisma } from '@prisma/client';

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
    @LogParam('dto') dto: CreateAssignmentSubmissionDto,
  ): Promise<AssignmentSubmissionDto> {
    if (!isUUID(assignmentId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid assignment or student ID format');
    }
    const submission = await this.prisma.client.assignmentSubmission.create({
      data: {
        ...dto,
        assignmentId,
        studentId,
        content: dto.content as Prisma.JsonValue,
      },
    });
    return {
      ...submission,
      content: submission.content as Prisma.JsonValue,
      groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
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
  async update(
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
        content: dto.content as Prisma.JsonValue,
      },
    });
    return {
      ...submission,
      content: submission.content as Prisma.JsonValue,
      groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
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
  async findById(@LogParam('id') id: string): Promise<AssignmentSubmission> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    const result =
      await this.prisma.client.assignmentSubmission.findUniqueOrThrow({
        where: { id },
      });
    return {
      ...result,
      content: result.content as Prisma.JsonValue,
      groupSnapshot: result.groupSnapshot as Prisma.JsonValue,
    };
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
