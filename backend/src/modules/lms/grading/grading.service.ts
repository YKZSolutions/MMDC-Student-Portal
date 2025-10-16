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
  CourseEnrollmentStatus,
  GradeRecord as PrismaGradeRecord,
  Prisma,
  SubmissionState,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { GradebookFilterDto } from '@/modules/lms/grading/dto/gradebook-filter.dto';
import {
  GradeEntryDto,
  GradebookForMentorDto,
  GradebookForStudentDto,
} from '@/modules/lms/grading/dto/gradebook.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { UpdateGradeRecordDto } from '@/generated/nestjs-dto/update-gradeRecord.dto';
import { GradeAssignmentSubmissionDto } from '@/modules/lms/grading/dto/grade-assignment-submission.dto';
import { GradeRecord } from '@/generated/nestjs-dto/gradeRecord.entity';
import { omitAuditDates } from '@/config/prisma_omit.config';
import { UserDto } from '@/generated/nestjs-dto/user.dto';

@Injectable()
export class GradingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  private logger = new Logger(GradingService.name, { timestamp: true });

  // SECTION: Gradebook / Grade View

  @Log({
    logArgsMessage: ({ filters, studentId, role }) =>
      `Fetching gradebook for user ${studentId} (${role}) with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: () => `Gradebook successfully fetched.`,
    logErrorMessage: (err, { studentId }) =>
      `Error fetching gradebook for user ${studentId}: ${err.message}`,
  })
  async getStudentGradebook(
    @LogParam('studentId') studentId: string,
    @LogParam('filters') filters: GradebookFilterDto,
    moduleIds?: string[] = [],
  ): Promise<GradebookForStudentDto> {
    const { moduleId, limit, page } = filters;
    moduleIds?.push(moduleId);

    const module = await this.prisma.client.module.findUnique({
      where: { id: moduleId },
      select: { courseOfferingId: true },
    });

    if (!module || !module.courseOfferingId) {
      throw new NotFoundException(
        'Module or associated course offering not found.',
      );
    }

    const [rawGradeBook, meta] = await this.prisma.client.assignment
      .paginate({
        where: {
          moduleContent: {
            moduleSection: {
              moduleId: { in: moduleIds },
            },
          },
          submissions: { some: { studentId: studentId } },
        },
        include: {
          moduleContent: {
            omit: omitAuditDates,
          },
          submissions: {
            where: { studentId: studentId },
            include: {
              gradeRecord: {
                omit: omitAuditDates,
              },
            },
            omit: omitAuditDates,
          },
        },
        omit: omitAuditDates,
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    // Get student info
    const student = await this.prisma.client.user.findUnique({
      where: { id: studentId },
      omit: omitAuditDates,
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const grades = rawGradeBook
      .map((item) => {
        const latestSubmission =
          item.submissions.length > 0
            ? item.submissions.reduce((latest, current) => {
                const currentDate = new Date(current.submittedAt || 0);
                const latestDate = new Date(latest.submittedAt || 0);
                return currentDate > latestDate ? current : latest;
              })
            : null;

        const gradeRecord = latestSubmission?.gradeRecord;

        if (!gradeRecord) {
          return null;
        }

        return {
          id: gradeRecord.id,
          rawScore: gradeRecord.rawScore,
          finalScore: gradeRecord.finalScore,
          grade: gradeRecord.grade,
          gradedAt: gradeRecord.gradedAt,
          feedback: gradeRecord.feedback,
          rubricEvaluationDetails: gradeRecord.rubricEvaluationDetails,
          submission: {
            contentId: item.moduleContentId,
            moduleId: moduleId,
            title: item.moduleContent?.title || 'Unknown Assignment',
            // Assignment properties
            moduleContentId: item.moduleContentId,
            mode: item.mode,
            maxScore: item.maxScore,
            weightPercentage: item.weightPercentage,
            maxAttempts: item.maxAttempts,
            allowLateSubmission: item.allowLateSubmission,
            latePenalty: item.latePenalty,
            dueDate: item.dueDate,
            gracePeriodMinutes: item.gracePeriodMinutes,
            // Submission properties
            assignmentId: item.id,
            studentId: studentId,
            groupId: latestSubmission?.groupId || null,
            groupSnapshot: latestSubmission?.groupSnapshot || null,
            state: latestSubmission?.state || SubmissionState.DRAFT,
            submittedAt: latestSubmission?.submittedAt,
            attemptNumber: latestSubmission?.attemptNumber || 0,
            lateDays: latestSubmission?.lateDays,
          },
        } as GradeEntryDto;
      })
      .filter((item) => item !== null);

    return {
      student: student as UserDto,
      grades,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ filters, mentorId }) =>
      `Fetching mentor gradebook for mentor ${mentorId} with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: () => `Mentor gradebook successfully fetched.`,
    logErrorMessage: (err, { mentorId }) =>
      `Error fetching mentor gradebook for mentor ${mentorId}: ${err.message}`,
  })
  async getMentorGradebook(
    @LogParam('mentor') mentorId: string,
    @LogParam('filters') filters: GradebookFilterDto,
  ): Promise<GradebookForMentorDto> {
    const { moduleId, courseOfferingId, courseSectionId, limit, page } =
      filters;

    // First, verify the mentor has access to the requested resources
    const mentorAccess = await this.prisma.client.courseSection.findFirst({
      where: {
        id: courseSectionId,
        mentorId: mentorId,
        ...(courseOfferingId && { courseOfferingId }),
        ...(moduleId && {
          sectionModules: {
            some: { moduleId },
          },
        }),
      },
      select: {
        id: true,
        courseOfferingId: true,
        sectionModules: {
          select: { moduleId: true },
        },
      },
    });

    if (!mentorAccess) {
      throw new NotFoundException(
        'Course section not found or you do not have access to this section.',
      );
    }

    // Get all students in the mentor's section
    const [enrollments, meta] = await this.prisma.client.courseEnrollment
      .paginate({
        where: {
          courseSectionId: mentorAccess.id,
          status: {
            in: ['enrolled', 'completed'] as CourseEnrollmentStatus[],
          },
        },
        include: {
          student: {
            omit: omitAuditDates,
          },
        },
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    if (enrollments.length === 0) {
      return {
        grades: [],
        meta,
      };
    }

    // Get all modules the mentor has access to in this section
    const accessibleModules = await this.prisma.client.sectionModule.findMany({
      where: {
        courseSectionId: mentorAccess.id,
        ...(moduleId && { moduleId }),
      },
      select: { moduleId: true },
    });

    const moduleIds = accessibleModules.map((sm) => sm.moduleId);

    // Fetch gradebook data for all students
    const gradebooks = await Promise.all(
      enrollments.map(async (enrollment) => {
        return this.getStudentGradebook(
          enrollment.studentId,
          filters,
          moduleIds,
        );
      }),
    );

    return {
      grades: gradebooks,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ filters, userId, role }) =>
      `Fetching gradebook for user ${userId} (${role}) with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: () => `Gradebook successfully fetched.`,
    logErrorMessage: (err, { userId }) =>
      `Error fetching gradebook for user ${userId}: ${err.message}`,
  })
  @Log({
    logArgsMessage: ({ filters, adminId }) =>
      `Fetching admin gradebook for admin ${adminId} with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: () => `Admin gradebook successfully fetched.`,
    logErrorMessage: (err, { adminId }) =>
      `Error fetching admin gradebook for admin ${adminId}: ${err.message}`,
  })
  async getAdminGradebook(
    @LogParam('admin') adminId: string,
    @LogParam('filters') filters: GradebookFilterDto,
  ): Promise<GradebookForMentorDto> {
    const {
      moduleId,
      studentId,
      courseOfferingId,
      courseSectionId,
      limit,
      page,
    } = filters;

    // Admin has access to everything, so we just validate the existence of resources
    const whereClause: Prisma.CourseEnrollmentWhereInput = {};

    if (courseSectionId) {
      const sectionExists = await this.prisma.client.courseSection.findUnique({
        where: { id: courseSectionId },
        select: { id: true },
      });
      if (!sectionExists) {
        throw new NotFoundException('Course section not found.');
      }
      whereClause.courseSectionId = courseSectionId;
    }

    if (courseOfferingId) {
      const offeringExists = await this.prisma.client.courseOffering.findUnique(
        {
          where: { id: courseOfferingId },
          select: { id: true },
        },
      );
      if (!offeringExists) {
        throw new NotFoundException('Course offering not found.');
      }
      whereClause.courseSection = {
        courseOfferingId: courseOfferingId,
      };
    }

    if (studentId) {
      const studentExists = await this.prisma.client.user.findUnique({
        where: {
          id: studentId,
          role: 'student',
        },
        select: { id: true },
      });
      if (!studentExists) {
        throw new NotFoundException('Student not found.');
      }
      whereClause.studentId = studentId;
    }

    // Default to enrolled students
    whereClause.status = {
      in: ['enrolled', 'completed'] as CourseEnrollmentStatus[],
    };

    const [enrollments, meta] = await this.prisma.client.courseEnrollment
      .paginate({
        where: whereClause,
        include: {
          student: {
            omit: omitAuditDates,
          },
          courseSection: {
            include: {
              sectionModules: {
                where: moduleId ? { moduleId } : {},
                select: { moduleId: true },
              },
            },
          },
        },
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    if (enrollments.length === 0) {
      return {
        grades: [],
        meta: {
          currentPage: page || 1,
          isFirstPage: true,
          isLastPage: true,
          previousPage: null,
          nextPage: null,
          pageCount: 1,
          totalCount: 0,
        },
      };
    }

    // Get module IDs based on filters
    let moduleIds: string[] = [];
    if (moduleId) {
      moduleIds = [moduleId];
    } else {
      // Get all unique module IDs from the sections
      const allModuleIds = enrollments.flatMap((enrollment) =>
        enrollment.courseSection.sectionModules.map((sm) => sm.moduleId),
      );
      moduleIds = [...new Set(allModuleIds)];
    }

    // Fetch gradebook data for all students
    const gradebooks = await Promise.all(
      enrollments.map(async (enrollment) => {
        return this.getStudentGradebook(
          enrollment.studentId,
          filters,
          moduleIds,
        );
      }),
    );

    return {
      grades: gradebooks,
      meta,
    };
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
          rubricEvaluationDetails: dto.rubricEvaluationDetails,
        },
      });

      await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: { state: SubmissionState.GRADED },
      });

      return gradeRecord;
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
      },
    });

    if (!gradeRecord) throw new NotFoundException('Grade record not found.');

    const submission = gradeRecord.assignmentSubmission;

    if (!submission) {
      throw new NotFoundException('Associated submission not found.');
    }

    const content = submission.assignment;

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

    return await this.prisma.client.gradeRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        rawScore,
        finalScore: dto.finalScore ?? finalScore,
        grade: dto.grade ?? grade,
        rubricEvaluationDetails: dto.rubricEvaluationDetails,
      },
    });
  }

  private async checkMentorPermission(
    mentorId: string,
    studentId: string,
    moduleContentId: string,
  ): Promise<void> {
    const content = await this.prisma.client.moduleContent.findUnique({
      where: { id: moduleContentId },
      select: {
        moduleSection: {
          select: {
            module: {
              select: {
                courseOfferingId: true,
              },
            },
          },
        },
      },
    });

    if (!content?.moduleSection.module?.courseOfferingId) {
      throw new NotFoundException(
        'Could not determine course offering for this content.',
      );
    }

    const enrollment = await this.prisma.client.courseEnrollment.findFirst({
      where: {
        studentId: studentId,
        courseOfferingId: content.moduleSection.module.courseOfferingId,
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
    latePenalty?: number | null,
  ): { finalScore: Prisma.Decimal; grade: string } {
    const penalty =
      lateDays && latePenalty
        ? new Prisma.Decimal(lateDays).times(
            Prisma.Decimal(latePenalty).div(100),
          )
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
