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
import { QuizSubmissionDto } from '@/generated/nestjs-dto/quizSubmission.dto';
import { QuizSubmission } from '@/generated/nestjs-dto/quizSubmission.entity';
import { isUUID } from 'class-validator';
import {
  Prisma,
  Quiz,
  SubmissionState,
  QuizSubmission as PrismaQuizSubmission,
} from '@prisma/client';
import { CreateQuizSubmissionDto } from '@/generated/nestjs-dto/create-quizSubmission.dto';
import { UpdateQuizSubmissionDto } from '@/generated/nestjs-dto/update-quizSubmission.dto';
import { QuizQuestionDto } from '@/modules/lms/content/quiz/dto/quiz-questions.dto';
import { QuizAnswersDto } from '@/modules/lms/content/quiz/dto/quiz-answers.dto';

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

    // Validate quiz exists
    const quiz = await this.prisma.client.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Set default state to DRAFT if not provided
    const submissionData = {
      ...dto,
      quizId,
      studentId,
      state: dto.state || SubmissionState.DRAFT,
      answers: dto.answers as Prisma.JsonValue,
      questionResults: dto.questionResults as Prisma.JsonValue,
    };

    const submission = await this.prisma.client.quizSubmission.create({
      data: submissionData,
    });

    return this.mapSubmission(submission);
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

    // Check if submission can be modified
    const existing = await this.prisma.client.quizSubmission.findUnique({
      where: { id },
      include: { quiz: true },
    });

    if (!existing) {
      throw new NotFoundException('Quiz submission not found');
    }

    if (existing.gradedAt) {
      throw new ForbiddenException('Cannot modify graded quiz submission');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException('Can only modify draft quiz submissions');
    }

    const submission = await this.prisma.client.quizSubmission.update({
      where: { id },
      data: {
        ...dto,
        answers: dto.answers as Prisma.JsonValue,
        questionResults: dto.questionResults as Prisma.JsonValue,
      },
    });

    return this.mapSubmission(submission);
  }

  @Log({
    logArgsMessage: ({ id }) => `Finalizing quiz submission ${id}`,
    logSuccessMessage: (submission) =>
      `Quiz submission [${submission.id}] successfully finalized.`,
    logErrorMessage: (err, { id }) =>
      `Error finalizing quiz submission ${id}: ${err.message}`,
  })
  async finalizeSubmission(
    @LogParam('id') id: string,
  ): Promise<QuizSubmissionDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }

    const existing = await this.prisma.client.quizSubmission.findUnique({
      where: { id },
      include: { quiz: true },
    });

    if (!existing) {
      throw new NotFoundException('Quiz submission not found');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException(
        'Only draft quiz submissions can be finalized',
      );
    }

    // Validate quiz has answers
    if (
      !existing.answers ||
      Object.keys(existing.answers as object).length === 0
    ) {
      throw new BadRequestException('Quiz submission must have answers');
    }

    // Validate attempt limit
    await this.validateQuizAttemptLimit(existing.quizId, existing.studentId);

    // Validate deadline
    const lateStatus = this.validateQuizDeadline(
      existing.quiz,
      true, // isFinalSubmission
    );

    // Auto-grade quiz if possible (simple scoring logic)
    const gradingResult = await this.autoGradeQuiz(existing);

    const submission = await this.prisma.client.quizSubmission.update({
      where: { id },
      data: {
        state: SubmissionState.SUBMITTED,
        submittedAt: new Date(),
        lateDays: lateStatus.isLate ? lateStatus.lateDays : null,
        attemptNumber: await this.calculateQuizAttemptNumber(
          existing.quizId,
          existing.studentId,
        ),
        ...gradingResult,
      },
    });

    return this.mapSubmission(submission);
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
    const result = await this.prisma.client.quizSubmission.findUniqueOrThrow({
      where: { id },
    });

    return {
      ...result,
      answers: result.answers as Prisma.JsonValue,
      questionResults: result.questionResults as Prisma.JsonValue,
    };
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
    const results = await this.prisma.client.quizSubmission.findMany({
      where: { quizId, studentId },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      answers: r.answers as Prisma.JsonValue,
      questionResults: r.questionResults as Prisma.JsonValue,
    }));
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
    const results = await this.prisma.client.quizSubmission.findMany({
      where: { quizId },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      answers: r.answers as Prisma.JsonValue,
      questionResults: r.questionResults as Prisma.JsonValue,
    }));
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
    const results = await this.prisma.client.quizSubmission.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
    });
    return results.map((r) => ({
      ...r,
      answers: r.answers as Prisma.JsonValue,
      questionResults: r.questionResults as Prisma.JsonValue,
    }));
  }

  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing quiz submission ${id} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { id }) => `Quiz submission ${id} hard deleted.`,
    logErrorMessage: (err, { id, directDelete }) =>
      `Error removing quiz submission ${id} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(@LogParam('id') id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid submission ID format');
    }

    // Check if submission can be deleted
    const existing = await this.prisma.client.quizSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quiz submission not found');
    }

    if (existing.gradedAt) {
      throw new ForbiddenException('Cannot delete graded quiz submission');
    }

    if (existing.state !== SubmissionState.DRAFT) {
      throw new ConflictException('Can only delete draft quiz submissions');
    }

    // Only allow hard delete since deletedAt does not exist
    await this.prisma.client.quizSubmission.delete({ where: { id } });
  }

  private async validateQuizAttemptLimit(
    quizId: string,
    studentId: string,
  ): Promise<void> {
    const quiz = await this.prisma.client.quiz.findUnique({
      where: { id: quizId },
      select: { maxAttempts: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const previousSubmissions = await this.prisma.client.quizSubmission.count({
      where: {
        quizId,
        studentId,
        state: SubmissionState.SUBMITTED,
      },
    });

    if (quiz.maxAttempts > 0 && previousSubmissions >= quiz.maxAttempts) {
      throw new ConflictException(
        `Maximum quiz attempts (${quiz.maxAttempts}) exceeded`,
      );
    }
  }

  private validateQuizDeadline(
    quiz: Quiz,
    isFinalSubmission: boolean,
  ): { isLate: boolean; lateDays?: number; penalty?: number } {
    if (!isFinalSubmission) {
      return { isLate: false };
    }

    const now = new Date();

    if (!quiz.dueDate) {
      return { isLate: false };
    }

    if (now <= quiz.dueDate) {
      return { isLate: false };
    }

    if (!quiz.allowLateSubmission) {
      throw new BadRequestException(
        'Late submissions are not allowed for this quiz',
      );
    }

    const lateDays = Math.ceil(
      (now.getTime() - quiz.dueDate.getTime()) / (1000 * 3600 * 24),
    );
    const penalty = quiz.latePenalty ? lateDays * Number(quiz.latePenalty) : 0;

    return { isLate: true, lateDays, penalty };
  }

  private async calculateQuizAttemptNumber(
    quizId: string,
    studentId: string,
  ): Promise<number> {
    const previousAttempts = await this.prisma.client.quizSubmission.count({
      where: {
        quizId,
        studentId,
        state: SubmissionState.SUBMITTED,
      },
    });

    return previousAttempts + 1;
  }

  private async autoGradeQuiz(
    submission: PrismaQuizSubmission,
  ): Promise<{ rawScore: number; questionResults: Prisma.JsonValue }> {
    try {
      const quiz = await this.prisma.client.quiz.findUniqueOrThrow({
        where: { id: submission.quizId },
        select: { questions: true },
      });

      if (!quiz.questions || !submission.answers) {
        throw new Error('Quiz questions or submission answers are missing');
      }

      const questions = quiz.questions as QuizQuestionDto[];
      const answers = submission.answers as QuizAnswersDto[];

      let totalScore = 0;
      let maxPossibleScore = 0;
      const questionResults: Array<{
        questionId: string;
        questionType: string;
        points: number;
        score: number;
        isCorrect: boolean;
        feedback?: string;
        correctAnswer?: any;
        studentAnswer?: any;
      }> = [];

      // Process each question
      for (const question of questions) {
        if (!question.id || !question.type || !question.points) continue;

        maxPossibleScore += question.points;
        const studentAnswer = answers.find((a) => a.questionId === question.id);

        // Grade based on question type
        const result = this.gradeQuestion(question, studentAnswer);
        const score = result.score * question.points;
        const isCorrect = result.score === 1;

        totalScore += score;

        questionResults.push({
          questionId: question.id,
          questionType: question.type,
          points: question.points,
          score,
          isCorrect,
          feedback: result.feedback || (isCorrect ? 'Correct' : 'Incorrect'),
          correctAnswer: this.getCorrectAnswer(question),
          studentAnswer:
            studentAnswer?.selectedAnswerId || studentAnswer?.textAnswer,
        });
      }

      // Calculate percentage score
      const percentageScore =
        maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      return {
        rawScore: parseFloat(percentageScore.toFixed(2)),
        questionResults: questionResults as unknown as Prisma.JsonValue,
      };
    } catch (error) {
      console.error('Auto-grading failed:', error);
      // Return zero score if grading fails
      return {
        rawScore: 0,
        questionResults: [] as unknown as Prisma.JsonValue,
      };
    }
  }

  private gradeQuestion(
    question: QuizQuestionDto,
    studentAnswer?: QuizAnswersDto,
  ): { score: number; feedback?: string } {
    if (!studentAnswer) {
      return { score: 0, feedback: 'No answer provided' };
    }

    try {
      switch (question.type) {
        case 'multiple_choice':
          return this.gradeMultipleChoice(
            question,
            studentAnswer.selectedAnswerId,
          );

        case 'true_false':
          return this.gradeTrueFalse(
            question,
            studentAnswer.selectedAnswerId === 'true',
          );

        case 'multiple_answer':
          return this.gradeMultipleAnswer(
            question,
            studentAnswer.selectedAnswerId,
          );

        case 'matching':
          return this.gradeMatching(question, studentAnswer.matchingAnswers);

        case 'short_answer':
          return this.gradeShortAnswer(
            question,
            studentAnswer.textAnswer || '',
          );

        case 'essay':
        case 'ordering':
        case 'fill_in_blank':
        default:
          return {
            score: 0,
            feedback: 'Manual grading required for this question type',
          };
      }
    } catch (error) {
      console.error(`Error grading question ${question.id}:`, error);
      return {
        score: 0,
        feedback: 'Error grading this question',
      };
    }
  }

  private gradeMultipleChoice(
    question: Extract<QuizQuestionDto, { type: 'multiple_choice' }>,
    selectedAnswerId?: string,
  ): { score: number; feedback?: string } {
    if (!selectedAnswerId) return { score: 0 };

    const correctOption = question.options.find((opt) => opt.correct);
    if (!correctOption)
      return { score: 0, feedback: 'No correct answer defined' };

    const isCorrect = selectedAnswerId === correctOption.id;
    const feedback = isCorrect
      ? question.feedback?.correct || 'Correct!'
      : question.feedback?.incorrect ||
        `Incorrect. The correct answer is: ${correctOption.text}`;

    return {
      score: isCorrect ? 1 : 0,
      feedback,
    };
  }

  private gradeTrueFalse(
    question: Extract<QuizQuestionDto, { type: 'true_false' }>,
    studentAnswer?: boolean,
  ): { score: number; feedback?: string } {
    const isCorrect = studentAnswer === question.correctAnswer;
    const feedback = isCorrect
      ? question.feedback?.correct || 'Correct!'
      : question.feedback?.incorrect ||
        `Incorrect. The correct answer is: ${question.correctAnswer ? 'True' : 'False'}`;

    return {
      score: isCorrect ? 1 : 0,
      feedback,
    };
  }

  private gradeMultipleAnswer(
    question: Extract<QuizQuestionDto, { type: 'multiple_answer' }>,
    selectedAnswerIds?: string | string[],
  ): { score: number; feedback?: string } {
    const studentAnswers = Array.isArray(selectedAnswerIds)
      ? selectedAnswerIds
      : selectedAnswerIds
        ? [selectedAnswerIds]
        : [];

    const correctAnswers = question.options
      .filter((opt) => opt.correct)
      .map((opt) => opt.id);

    if (correctAnswers.length === 0) {
      return { score: 0, feedback: 'No correct answers defined' };
    }

    const correctCount = studentAnswers.filter((id) =>
      correctAnswers.includes(id),
    ).length;

    const incorrectCount = studentAnswers.filter(
      (id) => !correctAnswers.includes(id),
    ).length;

    // Calculate score based on partial credit setting
    let score: number;
    if (question.partialCredit) {
      // Partial credit: (correct - incorrect) / total correct
      score = Math.max(
        0,
        (correctCount - incorrectCount) / correctAnswers.length,
      );
    } else {
      // All or nothing: must have exactly all correct answers and no incorrect ones
      score =
        correctCount === correctAnswers.length && incorrectCount === 0 ? 1 : 0;
    }

    let feedback: string;
    if (score === 1) {
      feedback = question.feedback?.correct || 'All answers correct!';
    } else if (score > 0) {
      feedback =
        question.feedback?.incorrect ||
        `Partially correct (${correctCount} correct, ${incorrectCount} incorrect)`;
    } else {
      feedback = question.feedback?.incorrect || 'Incorrect. Try again.';
    }

    return { score, feedback };
  }

  private gradeMatching(
    question: Extract<QuizQuestionDto, { type: 'matching' }>,
    studentAnswers?: Record<string, string>,
  ): { score: number; feedback?: string } {
    if (!studentAnswers) return { score: 0 };

    let correctCount = 0;
    // interface MatchingResult {
    //   item: string;
    //   correctMatch: string;
    //   studentMatch: string;
    //   isCorrect: boolean;
    // }
    // const results: MatchingResult[] = [];

    for (const match of question.matches) {
      const isCorrect = studentAnswers[match.id] === match.correctMatchId;
      if (isCorrect) correctCount++;

      // results.push({
      //   item: match.item,
      //   correctMatch:
      //     match.matches.find((m) => m.id === match.correctMatchId)?.text || '',
      //   studentMatch:
      //     match.matches.find((m) => m.id === studentAnswers[match.id])?.text ||
      //     'No answer',
      //   isCorrect,
      // });
    }

    const score = correctCount / question.matches.length;
    const feedback = `Matched ${correctCount} of ${question.matches.length} items correctly`;

    return { score, feedback };
  }

  private gradeShortAnswer(
    question: Extract<QuizQuestionDto, { type: 'short_answer' }>,
    answer: string,
  ): { score: number; feedback?: string } {
    if (!answer.trim()) return { score: 0, feedback: 'No answer provided' };

    // If there's an exact expected answer
    if (question.expectedAnswer) {
      const isCorrect = question.caseSensitive
        ? answer === question.expectedAnswer
        : answer.toLowerCase() === question.expectedAnswer.toLowerCase();

      return {
        score: isCorrect ? 1 : 0,
        feedback: isCorrect
          ? question.feedback?.correct || 'Correct!'
          : question.feedback?.incorrect || 'Incorrect. Try again.',
      };
    }

    // If there are acceptable answers
    if (question.acceptableAnswers?.length) {
      const normalizedAnswer = question.caseSensitive
        ? answer
        : answer.toLowerCase();

      const isCorrect = question.acceptableAnswers.some((expected) =>
        question.caseSensitive
          ? expected === normalizedAnswer
          : expected.toLowerCase() === normalizedAnswer,
      );

      return {
        score: isCorrect ? 1 : 0,
        feedback: isCorrect
          ? question.feedback?.correct || 'Correct!'
          : question.feedback?.incorrect || 'Incorrect. Try again.',
      };
    }

    // For regex matching
    if (question.matchPattern && question.matchType === 'regex') {
      try {
        const regex = new RegExp(
          question.matchPattern,
          question.caseSensitive ? '' : 'i',
        );
        const isCorrect = regex.test(answer);

        return {
          score: isCorrect ? 1 : 0,
          feedback: isCorrect
            ? question.feedback?.correct || 'Correct!'
            : question.feedback?.incorrect || 'Incorrect. Try again.',
        };
      } catch (e) {
        console.error('Invalid regex pattern:', e);
        return { score: 0, feedback: 'Error evaluating answer' };
      }
    }

    // Default: requires manual grading
    return {
      score: 0,
      feedback: 'This question requires manual grading',
    };
  }

  private getCorrectAnswer(question: QuizQuestionDto): string {
    switch (question.type) {
      case 'multiple_choice':
      case 'multiple_answer':
        return question.options
          .filter((opt) => 'correct' in opt && opt.correct)
          .map((opt) => opt.text)
          .join(', ');

      case 'true_false':
        return question.correctAnswer ? 'True' : 'False';

      case 'matching':
        return question.matches
          .map(
            (m) =>
              `${m.item} → ${m.matches.find((mm) => mm.id === m.correctMatchId)?.text || '?'}`,
          )
          .join('; ');

      case 'short_answer':
        return (
          question.expectedAnswer ||
          (question.acceptableAnswers?.length
            ? question.acceptableAnswers.join(' OR ')
            : 'No expected answer defined')
        );

      case 'essay':
        return 'Manual grading required';

      case 'ordering':
        return question.items
          .sort((a, b) => a.correctPosition - b.correctPosition)
          .map((item) => item.text)
          .join(' → ');

      case 'fill_in_blank':
        return question.content
          .map((part) =>
            part.type === 'blank'
              ? `[${part.correctAnswers?.join(' OR ') || '_____'}]`
              : part.content,
          )
          .join('');

      default:
        return 'No correct answer available';
    }
  }

  private mapSubmission(submission: PrismaQuizSubmission): QuizSubmission {
    return {
      ...submission,
      answers: submission.answers as Prisma.JsonValue,
      questionResults: submission.questionResults as Prisma.JsonValue,
    };
  }
}
