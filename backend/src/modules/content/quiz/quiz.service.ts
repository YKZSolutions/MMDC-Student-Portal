// quiz.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { CreateQuizDto } from '@/generated/nestjs-dto/create-quiz.dto';
import { QuizDto } from '@/generated/nestjs-dto/quiz.dto';
import { UpdateQuizDto } from '@/generated/nestjs-dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new quiz linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating quiz for module content ${moduleContentId}`,
    logSuccessMessage: (quiz) => `Quiz [${quiz.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating quiz for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Quiz already exists for this module content'),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('quizData') quizData: CreateQuizDto,
  ): Promise<QuizDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const quiz = await this.prisma.client.quiz.create({
      data: {
        ...quizData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...quiz,
      content: quiz.content as Prisma.JsonValue,
      questions: quiz.questions as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing quiz
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating quiz for module content ${moduleContentId}`,
    logSuccessMessage: (quiz) => `Quiz [${quiz.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating quiz for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Quiz not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('quizData') quizData: UpdateQuizDto,
  ): Promise<QuizDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const quiz = await this.prisma.client.quiz.update({
      where: { moduleContentId },
      data: quizData,
    });

    return {
      ...quiz,
      content: quiz.content as Prisma.JsonValue,
      questions: quiz.questions as Prisma.JsonValue,
    };
  }

  /**
   * Finds a quiz by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding quiz for module content ${moduleContentId}`,
    logSuccessMessage: (quiz) => `Quiz [${quiz.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding quiz for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Quiz not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<QuizDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const quiz = await this.prisma.client.quiz.findUniqueOrThrow({
      where: { moduleContentId },
      include: {
        submissions: true,
      },
    });

    return {
      ...quiz,
      content: quiz.content as Prisma.JsonValue,
      questions: quiz.questions as Prisma.JsonValue,
    };
  }

  /**
   * Deletes a quiz
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Deleting quiz for module content ${moduleContentId}`,
    logSuccessMessage: () => 'Quiz successfully deleted.',
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while deleting quiz for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Quiz not found'),
  })
  async delete(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    await this.prisma.client.quiz.delete({
      where: { moduleContentId },
    });

    return { message: 'Quiz successfully deleted' };
  }

  // /**
  //  * Finds quizzes with submissions for a specific student
  //  */
  // async findStudentQuizzes(
  //   studentId: string,
  //   filters: {
  //     courseOfferingId?: string;
  //     moduleId?: string;
  //     status?: 'submitted' | 'pending' | 'graded';
  //   } = {},
  // ) {
  //   if (!isUUID(studentId)) {
  //     throw new BadRequestException('Invalid student ID format');
  //   }
  //
  //   const where: Prisma.QuizWhereInput = {
  //     moduleContent: {
  //       module: {
  //         courseOfferingId: filters.courseOfferingId,
  //         id: filters.moduleId,
  //       },
  //     },
  //     submissions: {
  //       some: {
  //         studentId,
  //       },
  //     },
  //   };
  //
  //   // Add status filter if provided
  //   if (filters.status === 'submitted') {
  //     where.submissions.some.submittedAt = { not: null };
  //   } else if (filters.status === 'pending') {
  //     where.submissions.some.submittedAt = null;
  //   } else if (filters.status === 'graded') {
  //     where.submissions.some.rawScore = { not: null };
  //   }
  //
  //   return await this.prisma.client.quiz.findMany({
  //     where,
  //     include: {
  //       moduleContent: {
  //         include: {
  //           module: {
  //             include: {
  //               courseOffering: true,
  //             },
  //           },
  //         },
  //       },
  //       submissions: {
  //         where: { studentId },
  //         orderBy: { attemptNumber: 'desc' },
  //         take: 1, // Get only the latest attempt
  //       },
  //     },
  //     orderBy: {
  //       dueDate: 'asc',
  //     },
  //   });
  // }
  //
  // /**
  //  * Submits a quiz attempt for a student
  //  */
  // @Log({
  //   logArgsMessage: ({ quizId, studentId, answers }) =>
  //     `Submitting quiz attempt for student ${studentId} on quiz ${quizId}`,
  //   logSuccessMessage: (submission) =>
  //     `Quiz submission [${submission.id}] successfully created.`,
  //   logErrorMessage: (err, { quizId, studentId }) =>
  //     `An error has occurred while submitting quiz for student ${studentId} on quiz ${quizId} | Error: ${err.message}`,
  // })
  // async submitQuiz(
  //   @LogParam('quizId') quizId: string,
  //   @LogParam('studentId') studentId: string,
  //   @LogParam('answers') answers: Prisma.JsonValue,
  //   @LogParam('timeSpent') timeSpent: number,
  // ) {
  //   if (!isUUID(quizId) || !isUUID(studentId)) {
  //     throw new BadRequestException('Invalid ID format');
  //   }
  //
  //   // Get the quiz to check max attempts
  //   const quiz = await this.prisma.client.quiz.findUnique({
  //     where: { moduleContentId: quizId },
  //     select: { maxAttempts: true },
  //   });
  //
  //   if (!quiz) {
  //     throw new NotFoundException('Quiz not found');
  //   }
  //
  //   // Get the latest attempt number
  //   const latestAttempt = await this.prisma.client.quizSubmission.findFirst({
  //     where: { quizId, studentId },
  //     orderBy: { attemptNumber: 'desc' },
  //     select: { attemptNumber: true },
  //   });
  //
  //   const attemptNumber = (latestAttempt?.attemptNumber || 0) + 1;
  //
  //   // Check if max attempts exceeded
  //   if (attemptNumber > quiz.maxAttempts) {
  //     throw new BadRequestException('Maximum quiz attempts exceeded');
  //   }
  //
  //   // Create the submission
  //   return await this.prisma.client.quizSubmission.create({
  //     data: {
  //       quiz: { connect: { moduleContentId: quizId } },
  //       student: { connect: { id: studentId } },
  //       answers,
  //       timeSpent,
  //       attemptNumber,
  //       submittedAt: new Date(),
  //     },
  //   });
  // }
  //
  // /**
  //  * Grades a quiz submission
  //  */
  // @Log({
  //   logArgsMessage: ({ submissionId, graderId }) =>
  //     `Grading quiz submission ${submissionId} by grader ${graderId}`,
  //   logSuccessMessage: (submission) =>
  //     `Quiz submission [${submission.id}] successfully graded.`,
  //   logErrorMessage: (err, { submissionId }) =>
  //     `An error has occurred while grading quiz submission ${submissionId} | Error: ${err.message}`,
  // })
  // async gradeQuizSubmission(
  //   @LogParam('submissionId') submissionId: string,
  //   @LogParam('graderId') graderId: string,
  //   @LogParam('rawScore') rawScore: number,
  //   @LogParam('questionResults') questionResults: Prisma.JsonValue,
  // ) {
  //   if (!isUUID(submissionId) || !isUUID(graderId)) {
  //     throw new BadRequestException('Invalid ID format');
  //   }
  //
  //   return await this.prisma.client.quizSubmission.update({
  //     where: { id: submissionId },
  //     data: {
  //       rawScore,
  //       questionResults,
  //       gradedAt: new Date(),
  //     },
  //   });
  // }
}
