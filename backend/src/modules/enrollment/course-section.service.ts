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
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseSectionFullDto } from './dto/create-course-section.dto';
import { PaginatedCourseSectionsDto } from './dto/paginated-course-sections.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

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
      include: {
        enrollmentPeriod: true,
      },
    });

    if (!offering) {
      throw new NotFoundException('Offering not found in this enrollment');
    }

    if (offering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        'Cannot create a course section in a closed enrollment period.',
      );
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
   * Retrieves the full course section record by section id.
   *
   * This returns the `CourseSection` including `courseOffering` with nested
   * `course` and `enrollmentPeriod` so callers can access course details
   * using only the section id.
   */
  @Log({
    logArgsMessage: ({ sectionId }) =>
      `Fetching course section for id ${sectionId}`,
    logSuccessMessage: (section) =>
      `Successfully fetched course section ${section.id}`,
    logErrorMessage: (err, { sectionId }) =>
      `Error fetching course section ${sectionId} | Error: ${err.message}`,
  })
  async findOneCourseSectionById(@LogParam('sectionId') sectionId: string) {
    return await this.prisma.client.courseSection.findUniqueOrThrow({
      where: { id: sectionId },
      include: {
        courseOffering: {
          include: {
            course: {
              include: {
                coreqs: { select: { id: true, courseCode: true, name: true } },
                prereqs: { select: { id: true, courseCode: true, name: true } },
              },
            },
            enrollmentPeriod: true,
          },
        },
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
        `Related record missing while updating course section (mentor or offering not found).`,
      ),
  })
  async updateCourseSection(
    enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
    updateCourseSectionDto: UpdateCourseSectionDto,
  ): Promise<CourseSectionDto> {
    return await this.prisma.client.$transaction(async (tx) => {
      const existingCourseSection = await tx.courseSection.findFirstOrThrow({
        where: {
          id: sectionId,
          courseOfferingId: offeringId,
          courseOffering: {
            periodId: enrollmentId,
          },
        },
        include: { courseOffering: { include: { enrollmentPeriod: true } } },
      });

      if (
        existingCourseSection.courseOffering.enrollmentPeriod.status ===
        'closed'
      ) {
        throw new BadRequestException(
          `Enrollment period for this course section is closed and cannot be updated.`,
        );
      }

      if (updateCourseSectionDto.name) {
        await tx.courseSection
          .findFirst({
            where: {
              courseOfferingId: offeringId,
              name: updateCourseSectionDto.name,
              deletedAt: null,
            },
          })
          .then((existingSection) => {
            if (existingSection && existingSection.id !== sectionId) {
              throw new ConflictException(
                `A section with the name "${updateCourseSectionDto.name}" already exists for this offering.`,
              );
            }
          });
      }

      // Check first if the mentor has another section with overlapping schedule
      // NOTE: This only checks within the same enrollment period
      const { mentorId, startSched, endSched, days } = updateCourseSectionDto;

      if (mentorId) {
        const overlappingSection = await tx.courseSection.findFirst({
          where: {
            mentorId,
            id: { not: sectionId },
            courseOffering: {
              periodId: enrollmentId,
            },
            AND: [
              { startSched: { lt: endSched } },
              { endSched: { gt: startSched } },
              { days: { hasSome: days } },
            ],
          },
        });

        if (overlappingSection) {
          throw new BadRequestException(
            'The selected mentor is already assigned to another section with an overlapping schedule.',
          );
        }
      }

      return await tx.courseSection.update({
        where: { id: sectionId },
        data: { ...updateCourseSectionDto },
      });
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
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException(
        `Cannot delete course section because it is still being referenced by other records (e.g., enrollments). Drop the students from the enrollment first.`,
      ),
  })
  async removeCourseSection(
    @LogParam('enrollmentId') enrollmentId: string,
    @LogParam('offeringId') offeringId: string,
    @LogParam('sectionId') sectionId: string,
  ) {
    return await this.prisma.client.$transaction(async (tx) => {
      const section = await tx.courseSection.findFirstOrThrow({
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

      await tx.courseSection.delete({
        where: { id: sectionId },
      });

      return { message: 'Section removed successfully' };
    });
  }
}
