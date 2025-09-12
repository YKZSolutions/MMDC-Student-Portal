import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PaginatedEnrollmentPeriodsDto } from './dto/paginated-enrollment-period.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';

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
   * Retrieves the currently active enrollment period.
   *
   * @returns The active {@link EnrollmentPeriodDto}
   *
   * @throws NotFoundException - If no active enrollment period is found
   */
  @Log({
    logSuccessMessage: (_, result) => `Fetchde active enrollment ${result}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('No active enrollment found.'),
  })
  async findActiveEnrollment(): Promise<EnrollmentPeriodDto> {
    return await this.prisma.client.enrollmentPeriod.findFirstOrThrow({
      where: { status: 'active' },
    });
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
    return await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
      where: { id },
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
    return this.prisma.client.$transaction(async (tx) => {
      if (updateEnrollmentStatusDto.status === 'active') {
        // Close all others first
        await tx.enrollmentPeriod.updateMany({
          where: { status: 'active', NOT: { id } },
          data: { status: 'closed' },
        });
      }

      // Then update the requested one
      return tx.enrollmentPeriod.update({
        where: { id },
        data: { ...updateEnrollmentStatusDto },
      });
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
}
