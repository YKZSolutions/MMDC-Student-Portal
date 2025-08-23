import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { UpdateCourseSectionDto } from './dto/update-courseSection.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { PaginatedEnrollmentPeriodsDto } from './dto/paginated-enrollmentPeriod.dto';
import { PaginatedCourseOfferingsDto } from './dto/paginated-courseOffering.dto';
import { PaginatedCourseSectionsDto } from './dto/paginated-courseSections.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new enrollment period.
   *
   * @param createEnrollmentPeriodDto - DTO containing the enrollment period details
   * @returns The created {@link EnrollmentPeriodDto}
   *
   * @throws BadRequestException - If Prisma validation fails
   */
  @Log({
    logArgsMessage: ({ enrollment }) =>
      `Creating enrollment period [${enrollment.startYear}-${enrollment.endYear} ${enrollment.term}]`,
    logSuccessMessage: (enrollment) =>
      `Enrollment period [${enrollment.startYear}-${enrollment.endYear} ${enrollment.term}] successfully created.`,
    logErrorMessage: (err, { enrollment }) =>
      `An error has occurred while creating enrollment period [${enrollment.startYear}-${enrollment.endYear} ${enrollment.term}] | Error: ${err.message}`,
  })
  async createEnrollment(
    @LogParam('enrollment')
    createEnrollmentPeriodDto: CreateEnrollmentPeriodDto,
  ): Promise<EnrollmentPeriodDto> {
    return await this.prisma.client.enrollmentPeriod.create({
      data: { ...createEnrollmentPeriodDto },
    });
  }

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
    logArgsMessage: ({ periodId, courseOffering }) =>
      `Creating course offering [${courseOffering.code}] for period [${periodId}]`,
    logSuccessMessage: (offering, periodId) =>
      `Course offering [${offering.id}] successfully created for period [${periodId}]`,
    logErrorMessage: (err, { periodId, courseOffering }) =>
      `Error creating course offering [${courseOffering.code}] for period [${periodId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: (
      _,
      { periodId, courseOffering },
    ) =>
      new NotFoundException(
        `Enrollment period [${periodId}] or Course [${courseOffering.courseId}] does not exist.`,
      ),
    [PrismaErrorCode.ForeignKeyConstraint]: (_, { periodId, courseOffering }) =>
      new BadRequestException(
        `Invalid reference: Enrollment period [${periodId}] or Course [${courseOffering.courseId}] is invalid.`,
      ),
  })
  async createCourseOffering(
    @LogParam('periodId') periodId: string,
    @LogParam('courseOffering')
    createCourseOfferingDto: CreateCourseOfferingDto,
  ): Promise<CourseOfferingDto> {
    return await this.prisma.client.courseOffering.create({
      data: { ...createCourseOfferingDto, periodId },
    });
  }

  /**
   * Creates a new course section under a specific course offering.
   *
   * @param offeringId - The ID of the course offering
   * @param createCourseSectionFullDto - DTO containing the course section details
   * @returns The created {@link CourseSectionDto}
   *
   * @throws NotFoundException - If the course offering or mentor does not exist
   * @throws BadRequestException - If invalid references are provided
   */
  @Log({
    logArgsMessage: ({ offeringId, section }) =>
      `Creating course section [${section.days} ${section.startSched}-${section.endSched}] for offering [${offeringId}]`,
    logSuccessMessage: (offeringId, section) =>
      `Course section [${section.id}] successfully created for offering [${offeringId}]`,
    logErrorMessage: (err, { offeringId }) =>
      `Error creating course section for offering [${offeringId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: (_, { offeringId, section }) =>
      new NotFoundException(
        `Course offering [${offeringId}] or mentor [${section.mentorId}] does not exist.`,
      ),
    [PrismaErrorCode.ForeignKeyConstraint]: (_, { offeringId, section }) =>
      new BadRequestException(
        `Invalid reference: Course offering [${offeringId}] or mentor [${section.mentorId}] is invalid.`,
      ),
  })
  async createCourseSection(
    @LogParam('offeringId') offeringId: string,
    @LogParam('section') createCourseSectionFullDto: CreateCourseSectionFullDto,
  ): Promise<CourseSectionDto> {
    return await this.prisma.client.courseSection.create({
      data: { ...createCourseSectionFullDto, courseOfferingId: offeringId },
    });
  }

  /**
   * Retrieves a paginated list of enrollment periods.
   *
   * @param filters - Pagination filters
   * @returns A paginated list of enrollment periods
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching enrollment periods | page: ${filters.page}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.enrollments.length} enrollment periods (page ${result.meta.currentPage} of ${result.meta.pageCount})`,
    logErrorMessage: (err, { filters }) =>
      `Error fetching enrollment periods | page: ${filters.page ?? 1} | Error: ${err.message}`,
  })
  async findAllEnrollments(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedEnrollmentPeriodsDto> {
    const page = filters.page || 1;

    const [enrollments, meta] = await this.prisma.client.enrollmentPeriod
      .paginate()
      .withPages({ limit: 10, page, includePageCount: true });

    return { enrollments, meta };
  }

  /**
   * Retrieves a paginated list of course offerings.
   *
   * @param filters - Pagination filters
   * @returns A paginated list of course offerings
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching course offerings | page: ${filters.page}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.courseOfferings.length} course offerings (page ${result.meta.currentPage} of ${result.meta.pageCount})`,
    logErrorMessage: (err, { filters }) =>
      `Error fetching course offerings | page: ${filters.page} | Error: ${err.message}`,
  })
  async findAllCourseOfferings(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedCourseOfferingsDto> {
    const page = filters.page || 1;

    const [courseOfferings, meta] = await this.prisma.client.courseOffering
      .paginate()
      .withPages({ limit: 10, page, includePageCount: true });

    return { courseOfferings, meta };
  }

  /**
   * Retrieves a paginated list of course sections.
   *
   * @param filters - Pagination filters
   * @returns A paginated list of course sections with metadata
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching course sections | page: ${filters.page}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.courseSections.length} course sections (page ${result.meta.currentPage} of ${result.meta.pageCount})`,
    logErrorMessage: (err, { filters }) =>
      `Error fetching course sections | page: ${filters.page ?? 1} | Error: ${err.message}`,
  })
  async findAllCourseSections(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedCourseSectionsDto> {
    const page = filters.page || 1;

    const [courseSections, meta] = await this.prisma.client.courseSection
      .paginate()
      .withPages({ limit: 10, page, includePageCount: true });

    return { courseSections, meta };
  }

  /**
   * Retrieves a single enrollment period by ID.
   *
   * @param id - The enrollment period ID
   * @returns The corresponding {@link EnrollmentPeriodDto}
   *
   * @throws NotFoundException - If the enrollment does not exist
   * @throws BadRequestException - If the ID format is invalid
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching enrollment [${id}]`,
    logSuccessMessage: (enrollment) =>
      `Enrollment [${enrollment.id}] successfully retrieved.`,
    logErrorMessage: (err, { id }) =>
      `Error fetching enrollment [${id}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Enrollment [${id}] not found.`),
  })
  async findOneEnrollment(
    @LogParam('id') id: string,
  ): Promise<EnrollmentPeriodDto> {
    this.validateUUID(id);

    return await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
      where: { id },
    });
  }

  /**
   * Retrieves a single course offering by ID.
   *
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
    @LogParam('offeringId') offeringId: string,
  ): Promise<CourseOfferingDto> {
    this.validateUUID(offeringId);

    return await this.prisma.client.courseOffering.findUniqueOrThrow({
      where: { id: offeringId },
    });
  }

  /**
   * Retrieves a single course section under a specific offering.
   *
   * @param offeringId - The course offering ID
   * @param sectionId - The course section ID
   * @returns The corresponding {@link CourseSectionDto}
   *
   * @throws NotFoundException - If the course section or offering does not exist
   * @throws BadRequestException - If the ID format is invalid
   */
  @Log({
    logArgsMessage: ({ offeringId, sectionId }) =>
      `Fetching course section [${sectionId}] for offering [${offeringId}]`,
    logSuccessMessage: (section) =>
      `Course section [${section.id}] successfully retrieved.`,
    logErrorMessage: (err, { sectionId }) =>
      `Error fetching course section [${sectionId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { sectionId }) =>
      new NotFoundException(`Course section [${sectionId}] not found.`),
    [PrismaErrorCode.RelatedRecordNotFound]: (_, { offeringId }) =>
      new NotFoundException(
        `Course offering [${offeringId}] not found for this section.`,
      ),
  })
  async findOneCourseSection(
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
  ): Promise<CourseSectionDto> {
    this.validateUUID(offeringId, sectionId);

    return await this.prisma.client.courseSection.findFirstOrThrow({
      where: { id: sectionId, courseOfferingId: offeringId },
      include: {
        courseOffering: true,
      },
    });
  }

  /**
   * Updates the status of an enrollment period.
   *
   * @param id - The enrollment period ID
   * @param updateEnrollmentStatusDto - DTO containing the new status
   * @returns The updated {@link EnrollmentPeriodDto}
   *
   * @throws NotFoundException - If the enrollment does not exist
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating enrollment status [${id}]`,
    logSuccessMessage: (enrollment) =>
      `Enrollment [${enrollment.id}] status updated to [${enrollment.status}]`,
    logErrorMessage: (err, { id }) =>
      `Error updating enrollment status [${id}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Enrollment [${id}] not found.`),
  })
  async updateEnrollmentStatus(
    @LogParam('id') id: string,
    updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ): Promise<EnrollmentPeriodDto> {
    return await this.prisma.client.enrollmentPeriod.update({
      where: { id },
      data: { ...updateEnrollmentStatusDto },
    });
  }

  /**
   * Updates an enrollment period's details.
   *
   * @param id - The enrollment period ID
   * @param updateEnrollmentDto - DTO containing updated enrollment details
   * @returns The updated {@link EnrollmentPeriodDto}
   *
   * @throws NotFoundException - If the enrollment does not exist
   * @throws BadRequestException - If the enrollment is closed
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating enrollment [${id}]`,
    logSuccessMessage: (enrollment) =>
      `Enrollment [${enrollment.id}] successfully updated.`,
    logErrorMessage: (err, { id }) =>
      `Error updating enrollment [${id}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Enrollment [${id}] not found.`),
  })
  async updateEnrollment(
    @LogParam('id') id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentPeriodDto> {
    this.validateUUID(id);

    const enrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id },
      });

    if (enrollment.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${id} is closed and cannot be updated.`,
      );
    }

    return await this.prisma.client.enrollmentPeriod.update({
      where: { id },
      data: { ...updateEnrollmentDto },
    });
  }

  /**
   * Updates a course section under a specific offering.
   *
   * @param offeringId - The course offering ID
   * @param sectionId - The course section ID
   * @param updateCourseSectionDto - DTO containing updated section details
   * @returns The updated {@link CourseSectionDto}
   *
   * @throws NotFoundException - If the section does not exist
   * @throws BadRequestException - If the enrollment period is closed or invalid relations are provided
   */
  @Log({
    logArgsMessage: ({ offeringId, sectionId }) =>
      `Updating course section [${sectionId}] in offering [${offeringId}]`,
    logSuccessMessage: (section) =>
      `Course section [${section.id}] successfully updated.`,
    logErrorMessage: (err, { sectionId }) =>
      `Error updating course section [${sectionId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { sectionId }) =>
      new NotFoundException(`Course section [${sectionId}] not found.`),
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException(
        `Invalid relation provided (mentor or offering does not exist).`,
      ),
    [PrismaErrorCode.RelatedRecordNotFound]: (_, { sectionId }) =>
      new BadRequestException(
        `Related record missing while updating course section [${sectionId}] (mentor or offering not found).`,
      ),
  })
  async updateCourseSection(
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
    updateCourseSectionDto: UpdateCourseSectionDto,
  ): Promise<CourseSectionDto> {
    this.validateUUID(offeringId, sectionId);

    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
      },
      include: { courseOffering: { include: { enrollmentPeriod: true } } },
    });

    if (section.courseOffering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        `Enrollment period for this course section is closed and cannot be updated.`,
      );
    }

    return await this.prisma.client.courseSection.update({
      where: { id: sectionId },
      data: { ...updateCourseSectionDto },
    });
  }

  /**
   * Removes (soft or hard deletes) an enrollment period.
   *
   * @param id - The enrollment period ID
   * @param directDelete - If true, permanently deletes instead of soft-deleting
   * @returns A confirmation message
   *
   * @throws NotFoundException - If the enrollment does not exist
   * @throws BadRequestException - If the enrollment is closed or still referenced
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing enrollment [${id}] | directDelete: ${directDelete ?? false}`,
    logSuccessMessage: (_, { id, directDelete }) =>
      directDelete
        ? `Enrollment [${id}] permanently deleted.`
        : `Enrollment [${id}] marked for deletion.`,
    logErrorMessage: (err, { id }) =>
      `Error removing enrollment [${id}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Enrollment [${id}] not found.`),
    [PrismaErrorCode.ForeignKeyConstraint]: (_, { id }) =>
      new BadRequestException(
        `Enrollment [${id}] cannot be deleted because it is still referenced by other records.`,
      ),
  })
  async removeEnrollment(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ) {
    this.validateUUID(id);

    const enrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id },
      });

    if (enrollment.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${id} is closed and cannot be deleted.`,
      );
    }

    if (!directDelete && !enrollment.deletedAt) {
      await this.prisma.client.enrollmentPeriod.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Enrollment period marked for deletion' };
    }

    await this.prisma.client.enrollmentPeriod.delete({
      where: { id },
    });

    return { message: 'Enrollment permanently deleted' };
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
    this.validateUUID(periodId, courseOfferingId);

    // Check if course offering exists
    const offering = await this.prisma.client.courseOffering.findFirstOrThrow({
      where: { id: courseOfferingId, periodId: periodId },
      include: {
        enrollmentPeriod: true,
      },
    });

    if (offering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${periodId} is closed and cannot be deleted.`,
      );
    }

    await this.prisma.client.courseOffering.deleteMany({
      where: { id: courseOfferingId, periodId },
    });

    return { message: 'Course offering removed successfully' };
  }

  /**
   * Removes a course section from a specific course offering.
   *
   * @param offeringId - The course offering ID
   * @param sectionId - The course section ID
   * @returns A confirmation message
   *
   * @throws NotFoundException - If the section does not exist
   * @throws BadRequestException - If the enrollment is closed or section is referenced
   */
  @Log({
    logArgsMessage: ({ offeringId, sectionId }) =>
      `Removing course section [${sectionId}] from offering [${offeringId}]`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { sectionId }) =>
      `Error removing course section [${sectionId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { sectionId, offeringId }) =>
      new NotFoundException(
        `Course section [${sectionId}] not found in offering [${offeringId}].`,
      ),
    [PrismaErrorCode.ForeignKeyConstraint]: (_, { sectionId }) =>
      new BadRequestException(
        `Course section [${sectionId}] cannot be deleted because it is still referenced by other records (e.g., enrollments).`,
      ),
  })
  async removeCourseSection(
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
  ) {
    this.validateUUID(offeringId, sectionId);

    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
      },
      include: {
        courseOffering: {
          include: {
            enrollmentPeriod: true,
          },
        },
      },
    });

    if (section.courseOffering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        'Cannot remove a course section from a closed enrollment period.',
      );
    }

    await this.prisma.client.courseSection.delete({
      where: { id: sectionId },
    });

    return { message: 'Section removed successfully' };
  }

  private validateUUID(...ids: string[]) {
    ids.forEach((id) => {
      if (!isUUID(id))
        throw new BadRequestException(`Invalid ID format: ${id}`);
    });
  }
}
