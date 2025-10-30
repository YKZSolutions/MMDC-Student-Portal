import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { CustomPrismaService } from 'nestjs-prisma';
import { LmsService } from '../lms/lms-module/lms.service';
import { CreateEnrollmentPeriodItemDto } from './dto/create-enrollment-period.dto';
import { EnrollmentPeriodItemDto } from './dto/enrollment-period-item.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { PaginatedEnrollmentPeriodsDto } from './dto/paginated-enrollment-period.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { UpdateEnrollmentPeriodItemDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly lmsService: LmsService,
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
    createEnrollmentPeriodDto: CreateEnrollmentPeriodItemDto,
  ): Promise<EnrollmentPeriodDto> {
    return await this.prisma.client.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollmentPeriod.findFirst({
        where: {
          startYear: createEnrollmentPeriodDto.startYear,
          endYear: createEnrollmentPeriodDto.endYear,
          term: createEnrollmentPeriodDto.term,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          'Enrollment period already exists for the given duration.',
        );
      }

      return await tx.enrollmentPeriod.create({
        data: { ...createEnrollmentPeriodDto },
      });
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
    @LogParam('filters') filters: FilterEnrollmentDto,
  ): Promise<PaginatedEnrollmentPeriodsDto> {
    const page = filters.page || 1;
    const where: Prisma.EnrollmentPeriodWhereInput = {};

    where.status = filters.status ?? undefined;
    where.term = filters.term ? Number(filters.term) : undefined;

    const [enrollments, meta] = await this.prisma.client.enrollmentPeriod
      .paginate({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

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
  ): Promise<EnrollmentPeriodItemDto> {
    const enrollmentPeriod =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id },
        include: {
          pricingGroup: true,
        },
      });
    return {
      ...enrollmentPeriod,
      pricingGroup: enrollmentPeriod.pricingGroup || undefined,
    };
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
      const enrollmentPeriod = await tx.enrollmentPeriod.update({
        where: { id },
        data: { ...updateEnrollmentStatusDto },
      });

      return enrollmentPeriod;
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
    updateEnrollmentDto: UpdateEnrollmentPeriodItemDto,
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
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException(
        `Enrollment cannot be deleted because it is still referenced by other records.`,
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

    const enrolledStudents = await this.prisma.client.courseEnrollment.findMany(
      {
        where: {
          courseOffering: {
            enrollmentPeriod: {
              id: enrollment.id,
            },
          },
        },
      },
    );

    if (enrolledStudents.length > 0) {
      throw new BadRequestException(
        `Students are enrolled in this enrollment period. Please cancel the enrollment first.}`,
      );
    }

    if (enrollment.status === 'closed') {
      throw new BadRequestException(
        `Enrollment for Term ${enrollment.term} of SY ${enrollment.startYear}-${enrollment.endYear} is closed and cannot be deleted.`,
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

    await this.lmsService.removeModules(id);

    return { message: 'Enrollment permanently deleted' };
  }

  /**
   * Exports enrollment data for a specific enrollment period to an Excel file.
   *
   * @param enrollmentPeriodId - The ID of the enrollment period to export (optional, defaults to active)
   * @returns Buffer containing the Excel file
   *
   * @throws NotFoundException - If the enrollment period does not exist
   */
  @Log({
    logArgsMessage: ({ enrollmentPeriodId }) =>
      enrollmentPeriodId
        ? `Exporting enrollment data for period [${enrollmentPeriodId}]`
        : 'Exporting enrollment data for active period',
    logSuccessMessage: (_, { enrollmentPeriodId }) =>
      `Enrollment data successfully exported for period [${enrollmentPeriodId || 'active'}]`,
    logErrorMessage: (err, { enrollmentPeriodId }) =>
      `Error exporting enrollment data for period [${enrollmentPeriodId || 'active'}] | Error: ${err.message}`,
  })
  async exportEnrollmentData(
    @LogParam('enrollmentPeriodId') enrollmentPeriodId?: string,
  ): Promise<Buffer> {
    const enrollmentPeriod = enrollmentPeriodId
      ? await this.prisma.client.enrollmentPeriod.findUnique({
          where: { id: enrollmentPeriodId },
        })
      : await this.prisma.client.enrollmentPeriod.findFirst({
          where: { status: 'active' },
        });

    if (!enrollmentPeriod) {
      throw new NotFoundException(
        enrollmentPeriodId
          ? `Enrollment period [${enrollmentPeriodId}] not found`
          : 'No active enrollment period found',
      );
    }

    const courseEnrollments =
      await this.prisma.client.courseEnrollment.findMany({
        where: {
          courseOffering: { periodId: enrollmentPeriod.id },
          deletedAt: null,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              userAccount: { select: { email: true } },
            },
          },
          courseOffering: { include: { course: true } },
          courseSection: {
            include: {
              mentor: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: [
          { student: { lastName: 'asc' } },
          { student: { firstName: 'asc' } },
        ],
      });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Enrollment Data');

    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 38 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Middle Name', key: 'middleName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Course Code', key: 'courseCode', width: 15 },
      { header: 'Course Name', key: 'courseName', width: 40 },
      { header: 'Units', key: 'units', width: 10 },
      { header: 'Section', key: 'section', width: 15 },
      { header: 'Schedule Days', key: 'scheduleDays', width: 20 },
      { header: 'Start Time', key: 'startTime', width: 12 },
      { header: 'End Time', key: 'endTime', width: 12 },
      { header: 'Mentor', key: 'mentor', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Enrolled At', key: 'enrolledAt', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    courseEnrollments.forEach((enrollment) => {
      worksheet.addRow({
        studentId: enrollment.student.id,
        lastName: enrollment.student.lastName,
        firstName: enrollment.student.firstName,
        middleName: enrollment.student.middleName || 'N/A',
        email: enrollment.student.userAccount?.email || 'N/A',
        courseCode: enrollment.courseOffering?.course.courseCode || 'N/A',
        courseName: enrollment.courseOffering?.course.name || 'N/A',
        units: enrollment.courseOffering?.course.units || 0,
        section: enrollment.courseSection?.name || 'N/A',
        scheduleDays: enrollment.courseSection?.days?.join(', ') || 'N/A',
        startTime: enrollment.courseSection?.startSched || 'N/A',
        endTime: enrollment.courseSection?.endSched || 'N/A',
        mentor: enrollment.courseSection?.mentor
          ? `${enrollment.courseSection.mentor.firstName} ${enrollment.courseSection.mentor.lastName}`
          : 'No Mentor Assigned',
        status: enrollment.status,
        enrolledAt: enrollment.startedAt?.toISOString() || 'N/A',
      });
    });

    worksheet.insertRow(1, ['Enrollment Period Report']);
    worksheet.insertRow(2, [
      'School Year:',
      `${enrollmentPeriod.startYear}-${enrollmentPeriod.endYear}`,
    ]);
    worksheet.insertRow(3, ['Term:', enrollmentPeriod.term]);
    worksheet.insertRow(4, ['Status:', enrollmentPeriod.status]);
    worksheet.insertRow(5, ['Total Enrollments:', courseEnrollments.length]);
    worksheet.insertRow(6, []);

    worksheet.mergeCells('A1:O1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
