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
import { CreateQuizSubmissionDto } from '@/generated/nestjs-dto/create-quizSubmission.dto';
import { UpdateQuizSubmissionDto } from '@/generated/nestjs-dto/update-quizSubmission.dto';
import { QuizSubmissionDto } from '@/generated/nestjs-dto/quizSubmission.dto';
import { QuizSubmission } from '@/generated/nestjs-dto/quizSubmission.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class QuizSubmissionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ quizId, studentId }) =>
      `Creating quiz submission for quiz ${quizId} and student ${studentId}`,
    logSuccessMessage: (submission) =>
      `Quiz submission [${submission.id}] successfully created.`,
    logErrorMessage: (err, { quizId, studentId }) =>
      `Error creating quiz submission for quiz ${quizId} and student ${studentId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Submission already exists for this quiz and student.',
      ),
  })
  async create(
    @LogParam('quizId') quizId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('dto') dto: CreateQuizSubmissionDto,
  ): Promise<QuizSubmissionDto> {
    if (!isUUID(quizId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid quiz or student ID format');
    }
    const submission = await this.prisma.client.quizSubmission.create({
      data: {
        ...dto,
        quizId,
        studentId,
      },
    });
    return submission;
  }

  @Log({
    logArgsMessage: ({ id }) => `Updating quiz submission ${id}`,
    logSuccessMessage: (submission) =>
      `Quiz submission [${submission.id}] successfully updated.`,
    logErrorMessage: (err, { id }) =>
      `Error updating quiz submission ${id}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Quiz submission not found'),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') dto: UpdateQuizSubmissionDto,
  ): Promise<QuizSubmissionDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    const submission = await this.prisma.client.quizSubmission.update({
      where: { id },
      data: dto,
    });
    return submission;
  }

  @Log({
    logArgsMessage: ({ id }) => `Fetching quiz submission ${id}`,
    logSuccessMessage: (submission) =>
      `Quiz submission [${submission.id}] successfully fetched.`,
    logErrorMessage: (err, { id }) =>
      `Error fetching quiz submission ${id}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Quiz submission not found'),
  })
  async findById(@LogParam('id') id: string): Promise<QuizSubmission> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    return await this.prisma.client.quizSubmission.findUniqueOrThrow({
      where: { id },
    });
  }

  @Log({
    logArgsMessage: ({ quizId, studentId }) =>
      `Fetching quiz submissions for quiz ${quizId} and student ${studentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} quiz submissions.`,
    logErrorMessage: (err, { quizId, studentId }) =>
      `Error fetching quiz submissions for quiz ${quizId} and student ${studentId}: ${err.message}`,
  })
  async findByQuizAndStudent(
    @LogParam('quizId') quizId: string,
    @LogParam('studentId') studentId: string,
  ): Promise<QuizSubmission[]> {
    if (!isUUID(quizId) || !isUUID(studentId)) {
      throw new BadRequestException('Invalid quiz or student ID format');
    }
    return await this.prisma.client.quizSubmission.findMany({
      where: { quizId, studentId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  @Log({
    logArgsMessage: ({ quizId }) =>
      `Fetching all submissions for quiz ${quizId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} submissions for quiz.`,
    logErrorMessage: (err, { quizId }) =>
      `Error fetching submissions for quiz ${quizId}: ${err.message}`,
  })
  async findByQuiz(
    @LogParam('quizId') quizId: string,
  ): Promise<QuizSubmission[]> {
    if (!isUUID(quizId)) {
      throw new BadRequestException('Invalid quiz ID format');
    }
    return await this.prisma.client.quizSubmission.findMany({
      where: { quizId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  @Log({
    logArgsMessage: ({ studentId }) =>
      `Fetching all quiz submissions for student ${studentId}`,
    logSuccessMessage: (submissions) =>
      `Fetched ${submissions.length} quiz submissions for student.`,
    logErrorMessage: (err, { studentId }) =>
      `Error fetching quiz submissions for student ${studentId}: ${err.message}`,
  })
  async findByStudent(
    @LogParam('studentId') studentId: string,
  ): Promise<QuizSubmission[]> {
    if (!isUUID(studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }
    return await this.prisma.client.quizSubmission.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing quiz submission ${id} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { id, directDelete }) =>
      directDelete
        ? `Quiz submission ${id} hard deleted.`
        : `Quiz submission ${id} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { id, directDelete }) =>
      `Error removing quiz submission ${id} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }
    if (directDelete) {
      await this.prisma.client.quizSubmission.delete({ where: { id } });
    } else {
      await this.prisma.client.quizSubmission.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }
  }
}
