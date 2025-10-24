import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateEnrollmentPeriodItemDto } from './dto/create-enrollment-period.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { UpdateEnrollmentPeriodItemDto } from './dto/update-enrollment.dto';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  /**
   * Creates a new enrollment period
   *
   * @remarks
   * This operation creates a new enrollment period for managing course registrations.
   * Requires `ADMIN` role.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, ConflictException])
  createEnrollment(
    @Body() dto: CreateEnrollmentPeriodItemDto,
  ): Promise<EnrollmentPeriodDto> {
    return this.enrollmentService.createEnrollment(dto);
  }

  /**
   * Retrieves all enrollment periods
   *
   * @remarks
   * Fetches a paginated list of enrollment periods.
   * Requires `ADMIN`, `MENTOR`, or `STUDENT` roles.
   */
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get()
  findAllEnrollments(@Query() filters: FilterEnrollmentDto) {
    return this.enrollmentService.findAllEnrollments(filters);
  }

  /**
   * Retrieves the currently active enrollment period
   *
   * @remarks
   * Requires `ADMIN` or `STUDENT` roles.
   */
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiException(() => [NotFoundException])
  @Get('active')
  findActiveEnrollment() {
    return this.enrollmentService.findActiveEnrollment();
  }

  /**
   * Retrieves a specific enrollment period by ID
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment does not exist
   * @throws BadRequestException If an ID format is invalid
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Get(':enrollmentId')
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  findOneEnrollment(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
  ) {
    return this.enrollmentService.findOneEnrollment(enrollmentId);
  }

  /**
   * Updates an enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment does not exist
   * @throws BadRequestException If the enrollment is closed
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Patch(':enrollmentId')
  updateEnrollment(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentPeriodItemDto,
  ) {
    return this.enrollmentService.updateEnrollment(
      enrollmentId,
      updateEnrollmentDto,
    );
  }

  /**
   * Updates the status of an enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment does not exist
   */
  @ApiException(() => [NotFoundException])
  @Roles(Role.ADMIN)
  @Patch(':enrollmentId/status')
  updateEnrollmentStatus(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentService.updateEnrollmentStatus(
      enrollmentId,
      updateEnrollmentStatusDto,
    );
  }

  /**
   * Removes (soft or hard deletes) an enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment does not exist
   * @throws BadRequestException If enrollment is closed or still referenced
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Delete(':enrollmentId')
  removeEnrollment(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.enrollmentService.removeEnrollment(
      enrollmentId,
      query?.directDelete,
    );
  }

  /**
   * Exports active enrollment period data as an Excel file
   *
   * @remarks
   * Exports all course enrollments for the active enrollment period.
   * Requires `ADMIN` role.
   *
   * @returns Excel file with enrollment data
   *
   * @throws NotFoundException If no active enrollment period found
   */
  @Get('active/export')
  @Roles(Role.ADMIN)
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({
    description: 'Excel file containing enrollment data',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiException(() => [NotFoundException])
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportActiveEnrollmentData(@Res() res: Response) {
    const buffer = await this.enrollmentService.exportEnrollmentData();

    // Get active enrollment period info for filename
    const enrollmentPeriod =
      await this.enrollmentService.findActiveEnrollment();

    const filename = `enrollment-data-${enrollmentPeriod.startYear}-${enrollmentPeriod.endYear}-term${enrollmentPeriod.term}-active.xlsx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(buffer);
  }

  /**
   * Exports enrollment data for a specific enrollment period as an Excel file
   *
   * @remarks
   * Exports all course enrollments for the specified enrollment period (or active period if not specified).
   * Requires `ADMIN` role.
   *
   * @param enrollmentId - Optional enrollment period ID. If not provided, exports active period.
   * @returns Excel file with enrollment data
   *
   * @throws NotFoundException If the enrollment period does not exist or no active period found
   */
  @Get(':enrollmentPeriodId/export')
  @Roles(Role.ADMIN)
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({
    description: 'Excel file containing enrollment data',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiException(() => [NotFoundException])
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportEnrollmentData(
    @Param('enrollmentPeriodId', new ParseUUIDPipe())
    enrollmentPeriodId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.enrollmentService.exportEnrollmentData(enrollmentPeriodId);

    // Get enrollment period info for filename
    const enrollmentPeriod =
      await this.enrollmentService.findOneEnrollment(enrollmentPeriodId);

    const filename = `enrollment-data-${enrollmentPeriod.startYear}-${enrollmentPeriod.endYear}-term${enrollmentPeriod.term}.xlsx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(buffer);
  }
}
