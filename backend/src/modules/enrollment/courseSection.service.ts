import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { PaginatedCourseSectionsDto } from './dto/paginated-courseSections.dto';
import { UpdateCourseSectionDto } from './dto/update-courseSection.dto';

@Injectable()
export class CourseSectionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

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
    enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('section') createCourseSectionFullDto: CreateCourseSectionFullDto,
  ): Promise<CourseSectionDto> {
    const offering = await this.prisma.client.courseOffering.findFirst({
      where: { id: offeringId, periodId: enrollmentId },
    });

    if (!offering) {
      throw new NotFoundException('Offering not found in this enrollment');
    }

    return this.prisma.client.courseSection.create({
      data: { ...createCourseSectionFullDto, courseOfferingId: offeringId },
    });
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
    enrollmentId: string,
    offeringId?: string,
  ): Promise<PaginatedCourseSectionsDto> {
    const page = filters.page || 1;

    const [courseSections, meta] = await this.prisma.client.courseSection
      .paginate({
        where: {
          courseOffering: {
            periodId: enrollmentId,
            ...(offeringId && { id: offeringId }),
          },
        },
      })
      .withPages({ limit: 10, page, includePageCount: true });

    return { courseSections, meta };
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
    enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
  ): Promise<CourseSectionDto> {
    return await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
        courseOffering: {
          periodId: enrollmentId,
        },
      },
      include: {
        courseOffering: true,
      },
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
    enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
    updateCourseSectionDto: UpdateCourseSectionDto,
  ): Promise<CourseSectionDto> {
    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
        courseOffering: {
          periodId: enrollmentId,
        },
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
    @LogParam('enrollmentId') enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
  ) {
    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
        courseOffering: {
          periodId: enrollmentId,
        },
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
}
