import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { QuizDto } from '@/generated/nestjs-dto/quiz.dto';
import { UpdateQuizDto } from '@/generated/nestjs-dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  // /**
  //  * Creates a new quiz linked to a module content
  //  */
  // @Log({
  //   logArgsMessage: ({ moduleContentId }) =>
  //     `Creating quiz for module content ${moduleContentId}`,
  //   logSuccessMessage: (quiz) => `Quiz [${quiz.title}] successfully created.`,
  //   logErrorMessage: (err, { moduleContentId }) =>
  //     `An error has occurred while creating quiz for module content ${moduleContentId} | Error: ${err.message}`,
  // })
  // @PrismaError({
  //   [PrismaErrorCode.UniqueConstraint]: () =>
  //     new ConflictException('Quiz already exists for this module content'),
  // })
  // async create(
  //   @LogParam('moduleContentId') moduleContentId: string,
  //   @LogParam('quizData') quizData: UpdateQuizItemDto,
  //   @LogParam('transactionClient')
  //   tx?: PrismaTransaction,
  // ): Promise<QuizDto> {
  //   if (!isUUID(moduleContentId)) {
  //     throw new BadRequestException('Invalid module content ID format');
  //   }
  //
  //   if (!quizData.grading && !quizData.gradingId) {
  //     throw new BadRequestException('Quiz must have a grading config');
  //   }
  //
  //   const client = tx ?? this.prisma.client;
  //   const { gradingId, grading, ...quizDataWithoutGradingId } = quizData;
  //
  //   let data;
  //   if (gradingId) {
  //     data = {
  //       ...quizDataWithoutGradingId,
  //       moduleContentId,
  //       gradingId,
  //     };
  //   } else {
  //     data = {
  //       ...quizDataWithoutGradingId,
  //       moduleContent: { connect: { id: moduleContentId } },
  //       grading: { create: grading },
  //     };
  //   }
  //
  //   const quiz = await client.quiz.create({ data });
  //
  //   return {
  //     ...quiz,
  //     content: quiz.content as Prisma.JsonArray,
  //     questions: quiz.questions as Prisma.JsonArray,
  //   };
  // }

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
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<QuizDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const quiz = await client.quiz.update({
      where: { moduleContentId },
      data: quizData,
    });

    return {
      ...quiz,
      content: quiz.content as Prisma.JsonArray,
      questions: quiz.questions as Prisma.JsonArray,
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
      content: quiz.content as Prisma.JsonArray,
      questions: quiz.questions as Prisma.JsonArray,
    };
  }

  /**
   * Removes a quiz by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing quiz for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `Quiz for module content ${moduleContentId} hard deleted.`
        : `Quiz for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing quiz for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('directDelete') directDelete = false,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    if (directDelete) {
      await client.quiz.delete({ where: { moduleContentId } });
    } else {
      await client.quiz.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'Quiz successfully removed' };
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
  //   @LogParam('answers') answers: Prisma.JsonArray,
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
  //   @LogParam('questionResults') questionResults: Prisma.JsonArray,
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
