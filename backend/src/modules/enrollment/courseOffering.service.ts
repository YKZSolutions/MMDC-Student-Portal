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
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { FilterCourseOfferingDto } from './dto/filter-courseOffering.dto';
import { PaginatedCourseOfferingsDto } from './dto/paginated-courseOffering.dto';

@Injectable()
export class CourseOfferingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
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
  ): Promise<CourseOffering> {
    return await this.prisma.client.courseOffering.create({
      data: { ...createCourseOfferingDto, periodId },
    });
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
    @LogParam('filters') filters: FilterCourseOfferingDto,
    periodId: string,
  ): Promise<PaginatedCourseOfferingsDto> {
    const page = filters.page || 1;

    const [courseOfferings, meta] = await this.prisma.client.courseOffering
      .paginate({
        where: filters.periodId ? { periodId: filters.periodId } : undefined,
        include: {
          course: true,
          courseSections: {
            include: {
              user: true,
            },
          },
        },
      })
      .withPages({ limit: 10, page, includePageCount: true });

    return { courseOfferings, meta };
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
}
