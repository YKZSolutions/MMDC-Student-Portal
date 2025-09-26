import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
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
import {
  ContentType,
  Prisma,
  Role,
  SubmissionState,
  GradeRecord as PrismaGradeRecord,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { GradebookFilterDto } from '@/modules/lms/grading/dto/gradebook-filter.dto';
import {
  GradebookEntryDto,
  GradebookViewDto,
} from '@/modules/lms/grading/dto/gradebook.dto';
import { GradeQuizSubmissionDto } from '@/modules/lms/grading/dto/grade-quiz-submission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { UpdateGradeRecordDto } from '@/generated/nestjs-dto/update-gradeRecord.dto';
import { GradeAssignmentSubmissionDto } from '@/modules/lms/grading/dto/grade-assignment-submission.dto';
import { GradeRecord } from '@/generated/nestjs-dto/gradeRecord.entity';
import { GradableItem } from '@/modules/lms/grading/dto/gradable-item.dto';

@Injectable()
export class GradingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  private logger = new Logger(GradingService.name, { timestamp: true });

  // SECTION: Gradebook / Grade View

  @Log({
    logArgsMessage: ({ filters, userId, role }) =>
      `Fetching gradebook for user ${userId} (${role}) with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: () => `Gradebook successfully fetched.`,
    logErrorMessage: (err, { userId }) =>
      `Error fetching gradebook for user ${userId}: ${err.message}`,
  })
  async getGradebookForModule(
    @LogParam('user') userId: string,
    @LogParam('role') role: Role,
    @LogParam('filters') filters: GradebookFilterDto,
  ): Promise<GradebookViewDto> {
    const { moduleId, sectionId } = filters;

    const module = await this.prisma.client.module.findUnique({
      where: { id: moduleId },
      select: { courseOfferingId: true },
    });

    if (!module || !module.courseOfferingId) {
      throw new NotFoundException(
        'Module or associated course offering not found.',
      );
    }

    const rawGradableItemsFromPrisma =
      await this.prisma.client.moduleContent.findMany({
        where: {
          moduleId,
          contentType: { in: [ContentType.ASSIGNMENT, ContentType.QUIZ] },
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              grading: { select: { weight: true } },
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              grading: { select: { weight: true } },
            },
          },
        },
      });

    const gradableItems: GradableItem[] = rawGradableItemsFromPrisma
      .map((item) => {
        if (item.contentType === ContentType.ASSIGNMENT && item.assignment) {
          return {
            id: item.id,
            title: item.assignment.title,
            dueDate: item.assignment.dueDate,
            order: item.order,
            contentType: ContentType.ASSIGNMENT,
            assignmentId: item.assignment.id,
            grading: {
              weight: item.assignment.grading?.weight,
            },
          };
        }
        if (item.contentType === ContentType.QUIZ && item.quiz) {
          return {
            id: item.id,
            title: item.quiz.title,
            dueDate: item.quiz.dueDate,
            order: item.order,
            contentType: ContentType.QUIZ,
            quizId: item.quiz.id,
            grading: {
              weight: item.quiz.grading?.weight,
            },
          };
        }
        // This case should ideally not be hit if the query is correct
        return null;
      })
      .filter((item): item is GradableItem => item !== null);

    if (role === Role.student) {
      return this.getStudentGradebook(moduleId, userId, gradableItems);
    }

    return this.getInstructorGradebook(
      module.courseOfferingId,
      userId,
      role,
      gradableItems,
      sectionId,
      filters.limit,
      filters.page,
    );
  }

  // SECTION: Assignment Grading

  @Log({
    logArgsMessage: ({ submissionId, graderId }) =>
      `Grading assignment submission ${submissionId} by grader ${graderId}`,
    logSuccessMessage: (record) =>
      `Assignment submission graded successfully. Record ID: ${record.id}`,
    logErrorMessage: (err, { submissionId }) =>
      `Error grading assignment submission ${submissionId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'A grade record already exists for this submission.',
      ),
  })
  async gradeAssignmentSubmission(
    @LogParam('submissionId') submissionId: string,
    @LogParam('graderId') graderId: string,
    @LogParam('dto') dto: GradeAssignmentSubmissionDto,
  ): Promise<GradeRecordDto> {
    if (!isUUID(submissionId) || !isUUID(graderId)) {
      throw new BadRequestException('Invalid submission or grader ID format.');
    }

    const submission = await this.prisma.client.assignmentSubmission.findUnique(
      {
        where: { id: submissionId },
        include: { assignment: true },
      },
    );

    if (!submission)
      throw new NotFoundException('Assignment submission not found.');
    if (submission.state !== SubmissionState.SUBMITTED) {
      throw new ConflictException(
        'Can only grade submissions that have been submitted.',
      );
    }

    await this.checkMentorPermission(
      graderId,
      submission.studentId,
      submission.assignment.moduleContentId,
    );

    const { finalScore, grade } = this.calculateFinalGrade(
      dto.rawScore,
      submission.lateDays,
      submission.assignment.latePenalty,
    );

    return this.prisma.client.$transaction(async (tx) => {
      const gradeRecord: PrismaGradeRecord = await tx.gradeRecord.create({
        data: {
          studentId: submission.studentId,
          assignmentSubmissionId: submissionId,
          rawScore: dto.rawScore,
          finalScore,
          grade,
          feedback: dto.feedback,
          rubricScores:
            (dto.rubricScores as Prisma.JsonValue) || Prisma.JsonNull,
        },
      });

      await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: { state: SubmissionState.GRADED },
      });

      return {
        ...gradeRecord,
        rubricScores: gradeRecord.rubricScores as Prisma.JsonValue,
        questionScores: null,
      };
    });
  }

  @Log({
    logArgsMessage: ({ submissionId, graderId }) =>
      `Grading quiz submission ${submissionId} by grader ${graderId}`,
    logSuccessMessage: (record) =>
      `Quiz submission graded successfully. Record ID: ${record.id}`,
    logErrorMessage: (err, { submissionId }) =>
      `Error grading quiz submission ${submissionId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'A grade record already exists for this submission.',
      ),
  })
  async gradeQuizSubmission(
    @LogParam('submissionId') submissionId: string,
    @LogParam('graderId') graderId: string,
    @LogParam('dto') dto: GradeQuizSubmissionDto,
  ): Promise<GradeRecord> {
    if (!isUUID(submissionId) || !isUUID(graderId)) {
      throw new BadRequestException('Invalid submission or grader ID format.');
    }

    const submission = await this.prisma.client.quizSubmission.findUnique({
      where: { id: submissionId },
      include: { quiz: true },
    });

    if (!submission) throw new NotFoundException('Quiz submission not found.');
    if (submission.state !== SubmissionState.SUBMITTED) {
      throw new ConflictException('Can only grade submitted quizzes.');
    }

    await this.checkMentorPermission(
      graderId,
      submission.studentId,
      submission.quiz.moduleContentId,
    );

    const rawScore = dto.rawScore ?? submission.rawScore;
    if (rawScore === null || rawScore === undefined) {
      throw new BadRequestException(
        'Quiz has not been auto-graded and no raw score was provided.',
      );
    }

    const { finalScore, grade } = this.calculateFinalGrade(
      rawScore,
      submission.lateDays,
      submission.quiz.latePenalty,
    );

    return this.prisma.client.$transaction(async (tx) => {
      const gradeRecord = await tx.gradeRecord.create({
        data: {
          studentId: submission.studentId,
          quizSubmissionId: submissionId,
          rawScore: rawScore,
          finalScore,
          grade,
          feedback: dto.feedback,
          questionScores:
            (dto.questionScores as Prisma.JsonValue) || Prisma.JsonNull,
        },
      });

      await tx.quizSubmission.update({
        where: { id: submissionId },
        data: { state: SubmissionState.GRADED },
      });

      return {
        ...gradeRecord,
        rubricScores: null,
        questionScores: gradeRecord.questionScores as Prisma.JsonValue,
      };
    });
  }

  @Log({
    logArgsMessage: ({ recordId, graderId }) =>
      `Updating grade record ${recordId} by grader ${graderId}`,
    logSuccessMessage: (record) =>
      `Grade record ${record.id} successfully updated.`,
    logErrorMessage: (err, { recordId }) =>
      `Error updating grade record ${recordId}: ${err.message}`,
  })
  async updateGradeRecord(
    @LogParam('recordId') recordId: string,
    @LogParam('graderId') graderId: string,
    @LogParam('dto') dto: UpdateGradeRecordDto,
  ): Promise<GradeRecord> {
    if (!isUUID(recordId) || !isUUID(graderId)) {
      throw new BadRequestException('Invalid record or grader ID format.');
    }

    const gradeRecord = await this.prisma.client.gradeRecord.findUnique({
      where: { id: recordId },
      include: {
        assignmentSubmission: { include: { assignment: true } },
        quizSubmission: { include: { quiz: true } },
      },
    });

    if (!gradeRecord) throw new NotFoundException('Grade record not found.');

    const submission =
      gradeRecord.assignmentSubmission || gradeRecord.quizSubmission;

    if (!submission) {
      throw new NotFoundException('Associated submission not found.');
    }

    const content =
      'assignment' in submission ? submission.assignment : submission.quiz;

    await this.checkMentorPermission(
      graderId,
      gradeRecord.studentId,
      content.moduleContentId,
    );

    const rawScore = dto.rawScore ?? gradeRecord.rawScore;
    const { finalScore, grade } = this.calculateFinalGrade(
      rawScore,
      submission.lateDays,
      content.latePenalty,
    );

    const updated = await this.prisma.client.gradeRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        rawScore,
        finalScore: dto.finalScore ?? finalScore,
        grade: dto.grade ?? grade,
        rubricScores: (dto.rubricScores as Prisma.JsonValue) ?? undefined,
        questionScores: (dto.questionScores as Prisma.JsonValue) ?? undefined,
      },
    });

    return {
      ...updated,
      rubricScores: updated.rubricScores as Prisma.JsonValue,
      questionScores: updated.questionScores as Prisma.JsonValue,
    };
  }

  // SECTION: Private Helper Methods

  private async getStudentGradebook(
    moduleId: string,
    studentId: string,
    gradableItems: GradableItem[],
    limit?: number,
    page?: number,
  ): Promise<GradebookViewDto> {
    const student = await this.prisma.client.user.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found.');

    const [gradeRecords, meta] = await this.prisma.client.gradeRecord
      .paginate({
        where: {
          studentId,
          OR: [
            {
              assignmentSubmission: {
                assignment: { moduleContent: { moduleId } },
              },
            },
            { quizSubmission: { quiz: { moduleContent: { moduleId } } } },
          ],
        },
        include: {
          assignmentSubmission: {
            select: { id: true, state: true, assignmentId: true },
          },
          quizSubmission: { select: { id: true, state: true, quizId: true } },
        },
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    const grades: GradebookEntryDto[] = gradableItems.map(
      (item: GradableItem) => {
        let submissionId: string | null = null;
        let score: Prisma.Decimal | null = null;
        let status: SubmissionState | 'NOT_SUBMITTED' = 'NOT_SUBMITTED';

        if (item.contentType === ContentType.ASSIGNMENT) {
          const record = gradeRecords.find(
            (s) => s.assignmentSubmission?.assignmentId === item.assignmentId,
          );
          if (record) {
            submissionId = record.assignmentSubmissionId;
            score = record.finalScore;
            status = record.assignmentSubmission?.state || 'SUBMITTED';
          }
        } else if (item.contentType === ContentType.QUIZ) {
          // QUIZ
          const record = gradeRecords.find(
            (s) => s.quizSubmission?.quizId === item.quizId,
          );
          if (record) {
            submissionId = record.quizSubmissionId;
            score = record.finalScore;
            status = record.quizSubmission?.state || 'SUBMITTED';
          }
        }

        return {
          studentId,
          gradableItemId: item.id,
          submissionId,
          score,
          status,
        };
      },
    );

    const gradableAssignmentItems = gradableItems.filter(
      (item) => item.contentType === ContentType.ASSIGNMENT,
    );
    const gradableQuizItems = gradableItems.filter(
      (item) => item.contentType === ContentType.QUIZ,
    );

    return {
      students: [student],
      gradableAssignmentItems,
      gradableQuizItems,
      grades,
      meta,
    };
  }

  private async getInstructorGradebook(
    courseOfferingId: string,
    userId: string,
    role: Role,
    gradableItems: GradableItem[],
    sectionId?: string,
    limit?: number,
    page?: number,
  ): Promise<GradebookViewDto> {
    let studentWhereClause: Prisma.UserWhereInput = {};
    if (role === Role.mentor) {
      const mentorSections = await this.prisma.client.courseSection.findMany({
        where: { mentorId: userId, courseOfferingId },
        select: { id: true },
      });
      studentWhereClause = {
        courseEnrollment: {
          some: { courseSectionId: { in: mentorSections.map((s) => s.id) } },
        },
      };
    } else if (role === Role.admin && sectionId) {
      studentWhereClause = {
        courseEnrollment: {
          some: { courseSectionId: sectionId, courseOfferingId },
        },
      };
    } else {
      studentWhereClause = { courseEnrollment: { some: { courseOfferingId } } };
    }

    const students = await this.prisma.client.user.findMany({
      where: studentWhereClause,
    });
    const studentIds = students.map((s) => s.id);
    const moduleId = gradableItems[0].moduleId;

    const [allGradeRecords, meta] = await this.prisma.client.gradeRecord
      .paginate({
        where: {
          studentId: { in: studentIds },
          OR: [
            {
              assignmentSubmission: {
                assignment: { moduleContent: { moduleId } },
              },
            },
            { quizSubmission: { quiz: { moduleContent: { moduleId } } } },
          ],
        },
        include: {
          assignmentSubmission: {
            select: { id: true, state: true, assignmentId: true },
          },
          quizSubmission: { select: { id: true, state: true, quizId: true } },
        },
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    const grades: GradebookEntryDto[] = [];
    for (const student of students) {
      for (const item of gradableItems) {
        const record = allGradeRecords.find(
          (r) =>
            r.studentId === student.id &&
            ('assignmentId' in item
              ? r.assignmentSubmission?.assignmentId === item.assignmentId
              : r.quizSubmission?.quizId === item.quizId),
        );

        grades.push({
          studentId: student.id,
          gradableItemId: item.id,
          submissionId:
            record?.assignmentSubmissionId || record?.quizSubmissionId || null,
          score: record?.finalScore || null,
          status:
            record?.assignmentSubmission?.state ||
            record?.quizSubmission?.state ||
            'NOT_SUBMITTED',
        });
      }
    }

    const gradableAssignmentItems = gradableItems.filter(
      (item) => item.contentType === ContentType.ASSIGNMENT,
    );
    const gradableQuizItems = gradableItems.filter(
      (item) => item.contentType === ContentType.QUIZ,
    );

    return {
      students,
      gradableAssignmentItems,
      gradableQuizItems,
      grades,
      meta,
    };
  }

  private async checkMentorPermission(
    mentorId: string,
    studentId: string,
    moduleContentId: string,
  ): Promise<void> {
    const content = await this.prisma.client.moduleContent.findUnique({
      where: { id: moduleContentId },
      select: { module: { select: { courseOfferingId: true } } },
    });

    if (!content?.module.courseOfferingId) {
      throw new NotFoundException(
        'Could not determine course offering for this content.',
      );
    }

    const enrollment = await this.prisma.client.courseEnrollment.findFirst({
      where: {
        studentId: studentId,
        courseOfferingId: content.module.courseOfferingId,
      },
      include: { courseSection: true },
    });

    if (!enrollment)
      throw new ForbiddenException('Student is not enrolled in this course.');
    if (enrollment.courseSection.mentorId !== mentorId) {
      throw new ForbiddenException(
        'You do not have permission to grade this student.',
      );
    }
  }

  private calculateFinalGrade(
    rawScore: Prisma.Decimal,
    lateDays?: number | null,
    latePenalty?: Prisma.Decimal | null,
  ): { finalScore: Prisma.Decimal; grade: string } {
    const penalty =
      lateDays && latePenalty
        ? new Prisma.Decimal(lateDays).times(latePenalty)
        : new Prisma.Decimal(0);
    const finalScore = Prisma.Decimal.max(
      0,
      new Prisma.Decimal(rawScore).minus(penalty),
    );
    const grade = this.mapScoreToGrade(finalScore);
    return { finalScore, grade };
  }

  private mapScoreToGrade(score: Prisma.Decimal): string {
    const numericScore = score.toNumber();
    if (numericScore >= 90) return 'A';
    if (numericScore >= 80) return 'B';
    if (numericScore >= 70) return 'C';
    if (numericScore >= 60) return 'D';
    return 'F';
  }
}
