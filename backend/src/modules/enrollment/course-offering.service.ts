import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { CourseOffering } from '@/generated/nestjs-dto/courseOffering.entity';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseOfferingCurriculumDto } from './dto/create-course-offering-curriculum.dto';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import {
  CourseOfferingStatus,
  FilterCourseOfferingDto,
} from './dto/filter-course-offering.dto';
import { PaginatedCourseOfferingsDto } from './dto/paginated-course-offering.dto';
import { LmsService } from '@/modules/lms/lms-module/lms.service';
import { CustomDetailedCourseOfferingDto } from '@/modules/lms/lms-module/dto/paginated-module.dto';

@Injectable()
export class CourseOfferingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private lmsService: LmsService,
  ) {}

  /**
   * Creates a new course offering under a specific enrollment period.
   *
   * @param periodId - The ID of the enrollment period
   * @param createCourseOfferingDto - DTO containing the course offering details
   * @returns The created {@link CourseOfferingDto}
   *
   * @throws NotFoundException - If the enrollment period or course does not exist
   * @throws BadRequestException - If invalid references are provided
   */
  @Log({
    logArgsMessage: ({
      periodId,
      courseOffering,
    }: {
      periodId: string;
      courseOffering: CreateCourseOfferingDto;
    }) =>
      `Creating course offering [${courseOffering.courseId}] for period [${periodId}]`,
    logSuccessMessage: (offering, { periodId }) =>
      `Course offering [${offering.id}] successfully created for period [${periodId}]`,
    logErrorMessage: (
      err,
      {
        periodId,
        courseOffering,
      }: { periodId: string; courseOffering: CreateCourseOfferingDto },
    ) =>
      `Error creating course offering [${courseOffering.courseId}] for period [${periodId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: (
      _,
      {
        periodId,
        courseOffering,
      }: { periodId: string; courseOffering: CreateCourseOfferingDto },
    ) =>
      new NotFoundException(
        `Enrollment period [${periodId}] or Course [${courseOffering.courseId}] does not exist.`,
      ),
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(`This course is already offered in this period.`),
  })
  async createCourseOffering(
    @LogParam('periodId') periodId: string,
    @LogParam('courseOffering')
    createCourseOfferingDto: CreateCourseOfferingDto,
  ): Promise<CourseOffering> {
    const newCourseOffering = await this.prisma.client.courseOffering.create({
      data: { ...createCourseOfferingDto, periodId },
    });

    await this.lmsService.cloneMostRecentModules(
      periodId,
      newCourseOffering.id,
    );

    return newCourseOffering;
  }

  /**
   * Create courses under an enrollment period based on a given curriculum
   *
   * @param periodId - The ID of the enrollment period
   * @param createCourseOfferingDto - DTO containing the curriculum id
   * @returns The created {@link CourseOfferingDto[]}
   *
   * @throws NotFoundException - If the enrollment period or course does not exist
   * @throws BadRequestException - If invalid references are provided
   */
  @Log({
    logArgsMessage: ({
      periodId,
      courseOffering,
    }: {
      periodId: string;
      courseOffering: CreateCourseOfferingCurriculumDto;
    }) =>
      `Creating curriculum course offering [${courseOffering.curriculumId}] for period [${periodId}]`,
    logSuccessMessage: (offering, { periodId }) =>
      `Curriculum course offerings with ${offering.length} items successfully created for period [${periodId}]`,
    logErrorMessage: (
      err,
      {
        periodId,
        courseOffering,
      }: {
        periodId: string;
        courseOffering: CreateCourseOfferingCurriculumDto;
      },
    ) =>
      `Error creating course offering [${courseOffering.curriculumId}] for period [${periodId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: () =>
      new NotFoundException(`Enrollment period or Curriculum does not exist.`),
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        `This curriculum is already offered in this period.`,
      ),
  })
  async createCourseOfferingsByCurriculum(
    @LogParam('periodId') periodId: string,
    @LogParam('courseOffering')
    createCourseOfferingDto: CreateCourseOfferingCurriculumDto,
  ): Promise<CourseOffering[]> {
    const courseOfferings = await this.prisma.client.$transaction(
      async (tx) => {
        const enrollmentPeriod = await tx.enrollmentPeriod.findFirst({
          where: { id: periodId },
          include: {
            courseOfferings: true,
          },
        });

        if (!enrollmentPeriod) {
          throw new NotFoundException(`Enrollment period not found.`);
        }

        if (enrollmentPeriod.status === 'closed') {
          throw new BadRequestException(
            `Cannot create course offerings since this period has already ended.`,
          );
        }

        const existingOfferings = enrollmentPeriod?.courseOfferings;

        const curriculumCourses = await tx.curriculumCourse.findMany({
          where: { curriculumId: createCourseOfferingDto.curriculumId },
          include: {
            course: true,
          },
        });

        if (curriculumCourses.length === 0) {
          throw new BadRequestException(
            `This curriculum does not have any courses configured`,
          );
        }

        let coursesToCreate = curriculumCourses;

        if (existingOfferings.length > 0) {
          coursesToCreate = curriculumCourses.filter(
            (course) =>
              !existingOfferings.some(
                (offering) => offering.courseId === course.course.id,
              ),
          );

          if (coursesToCreate.length === 0) {
            throw new ConflictException(
              `All courses for this curriculum already exist in this period: SY ${enrollmentPeriod.startYear}-${enrollmentPeriod.endYear} | Term ${enrollmentPeriod.term}`,
            );
          }
        }

        return tx.courseOffering.createManyAndReturn({
          data: coursesToCreate.map((item) => ({
            courseId: item.course.id,
            periodId: periodId,
          })),
        });
      },
    );

    await this.lmsService.cloneMostRecentModules(periodId);

    return courseOfferings;
  }

  /**
   * Retrieves a paginated list of course offerings.
   *
   * @param filters - Pagination filters
   * @param enrollmentId - The enrollment period ID
   * @param userId - The user ID
   * @param role - The user role
   *
   * @returns A paginated list of course offerings
   */
  @Log({
    logArgsMessage: ({ filters }: { filters: FilterCourseOfferingDto }) =>
      `Fetching course offerings | page: ${filters.page}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.courseOfferings.length} course offerings (page ${result.meta.currentPage} of ${result.meta.pageCount})`,
    logErrorMessage: (err, { filters }: { filters: FilterCourseOfferingDto }) =>
      `Error fetching course offerings | page: ${filters.page} | Error: ${err.message}`,
  })
  async findAllCourseOfferings(
    @LogParam('enrollmentId') enrollmentId: string,
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    @LogParam('filters') filters: FilterCourseOfferingDto,
  ): Promise<PaginatedCourseOfferingsDto> {
    const page = filters.page || 1;
    const status = (filters.status || undefined) satisfies
      | CourseOfferingStatus
      | undefined;

    const isStudent = role === Role.student;
    const studentId = userId;

    const whereClause: Prisma.CourseOfferingWhereInput = {};

    if (enrollmentId) {
      whereClause.periodId = enrollmentId;
    }

    if (
      isStudent &&
      (status === CourseOfferingStatus.ENROLLED ||
        status === CourseOfferingStatus.NOT_ENROLLED)
    ) {
      whereClause.courseEnrollments =
        status === CourseOfferingStatus.ENROLLED
          ? { some: { studentId, status: { not: 'dropped' } } } // offerings the student is enrolled in
          : { none: { studentId, status: { not: 'dropped' } } }; // offerings the student is NOT enrolled in
    }

    const includeClause = {
      course: true,
      courseSections: {
        include: {
          mentor: true,
          _count: {
            select: {
              courseEnrollments: {
                where: { status: { not: 'dropped' } },
              },
            },
          },
        },
      },

      // Disable fetching for the admin side first
      // TODO: Implement an FE interface for this
      courseEnrollments: isStudent
        ? {
            where: { studentId, status: { not: 'dropped' } },
          }
        : undefined,
    } satisfies Prisma.CourseOfferingInclude;

    const [courseOfferings, meta] = await this.prisma.client.courseOffering
      .paginate({
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: includeClause,
      })
      .withPages({ limit: 10, page, includePageCount: true });

    // Calculate available slots for each course section
    const offeringWithAvailableSlots = courseOfferings.map((offering) => ({
      ...offering,
      courseSections: offering.courseSections.map((section) => ({
        ...section,
        availableSlots: section.maxSlot - section._count.courseEnrollments,
      })),
    }));

    return { courseOfferings: offeringWithAvailableSlots, meta };
  }

  /**
   * Retrieves a paginated list of course offerings.
   *
   * @param userId - The user ID
   * @param role - The user role
   *
   * @returns A paginated list of course offerings
   */
  @Log({
    logArgsMessage: ({ filters }: { filters: FilterCourseOfferingDto }) =>
      `Fetching course offerings | page: ${filters}`,
    logSuccessMessage: (result) => `Fetched ${result.length} course offerings`,
    logErrorMessage: (err, { filters }: { filters: FilterCourseOfferingDto }) =>
      `Error fetching course offerings | page: ${filters.page} | Error: ${err.message}`,
  })
  async findActiveCourseOfferings(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
  ): Promise<CustomDetailedCourseOfferingDto[]> {
    const whereClause: Prisma.CourseOfferingWhereInput = {
      enrollmentPeriod: {
        status: 'active',
      },
    };

    const includeClause = {
      course: true,
      courseSections: {
        include: {
          mentor: true,
          _count: {
            select: {
              courseEnrollments: {
                where: { status: { not: 'dropped' } },
              },
            },
          },
        },
      },
    } satisfies Prisma.CourseOfferingInclude;

    const courseOfferings = await this.prisma.client.courseOffering.findMany({
      where: Object.keys(whereClause).length ? whereClause : undefined,
      include: includeClause,
    });

    // Calculate available slots for each course section
    return courseOfferings.map((offering) => ({
      ...offering,
      courseSections: offering.courseSections.map((section) => ({
        ...section,
        availableSlots: section.maxSlot - section._count.courseEnrollments,
      })),
    }));
  }

  /**
   * Retrieves a single course offering by ID.
   *
   * @param enrollmentId - The enrollment period ID
   * @param offeringId - The course offering ID
   * @returns The corresponding {@link CourseOfferingDto}
   *
   * @throws NotFoundException - If the course offering does not exist
   * @throws BadRequestException - If the ID format is invalid
   */
  @Log({
    logArgsMessage: ({ offeringId }) =>
      `Fetching course offering [${offeringId}]`,
    logSuccessMessage: (offering) =>
      `Course offering [${offering.id}] successfully retrieved.`,
    logErrorMessage: (err, { offeringId }) =>
      `Error fetching course offering [${offeringId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { offeringId }) =>
      new NotFoundException(`Course offering [${offeringId}] not found.`),
  })
  async findOneCourseOffering(
    @LogParam('enrollmentId') enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
  ): Promise<CourseOfferingDto> {
    return await this.prisma.client.courseOffering.findFirstOrThrow({
      where: { id: offeringId, periodId: enrollmentId },
    });
  }

  /**
   * Removes a course offering from a specific enrollment period.
   *
   * @param periodId - The enrollment period ID
   * @param courseOfferingId - The course offering ID
   * @returns A confirmation message
   *
   * @throws NotFoundException - If the course offering does not exist
   * @throws BadRequestException - If the enrollment is closed or offering is referenced
   */
  @Log({
    logArgsMessage: ({ periodId, courseOfferingId }) =>
      `Removing course offering [${courseOfferingId}] from period [${periodId}]`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { courseOfferingId }) =>
      `Error removing course offering [${courseOfferingId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { courseOfferingId, periodId }) =>
      new NotFoundException(
        `Course offering [${courseOfferingId}] not found in enrollment period [${periodId}].`,
      ),
    [PrismaErrorCode.ForeignKeyConstraint]: (_, { courseOfferingId }) =>
      new BadRequestException(
        `Course offering [${courseOfferingId}] cannot be deleted because it is still referenced by other records (e.g., enrolled courses or sections).`,
      ),
  })
  async removeCourseOffering(
    @LogParam('periodId') periodId: string,
    @LogParam('courseOfferingId') courseOfferingId: string,
  ) {
    return await this.prisma.client.$transaction(async (tx) => {
      // Check if the course offering exists
      const offering = await tx.courseOffering.findFirstOrThrow({
        where: { id: courseOfferingId, periodId: periodId },
        include: {
          enrollmentPeriod: true,
        },
      });

      const periodStatus = offering.enrollmentPeriod.status;

      if (periodStatus === 'closed') {
        throw new BadRequestException(
          `Cannot remove course offering since this period has already ended.`,
        );
      }

      if (periodStatus === 'active') {
        const enrolledCourses = await tx.courseEnrollment.findMany({
          where: {
            courseOfferingId: courseOfferingId,
            status: { not: 'dropped' },
          },
        });

        if (enrolledCourses.length > 0) {
          throw new BadRequestException(
            `${enrolledCourses.length} student/s have enrolled in this course. Please cancel the enrollment or contact the students to drop the course.`,
          );
        }
      }

      await tx.courseOffering.deleteMany({
        where: { id: courseOfferingId, periodId },
      });

      return { message: 'Course offering removed successfully' };
    });
  }
}
