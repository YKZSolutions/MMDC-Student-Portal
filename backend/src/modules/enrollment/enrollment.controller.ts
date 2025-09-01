import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';
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
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN)
  @Post()
  createEnrollment(@Body() dto: CreateEnrollmentPeriodDto) {
    return this.enrollmentService.createEnrollment(dto);
  }

  /**
   * Retrieves all enrollment periods
   *
   * @remarks
   * Fetches a paginated list of enrollment periods.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN)
  @Get()
  findAllEnrollments(@Query() filters: BaseFilterDto) {
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
   * @throws BadRequestException If ID format is invalid
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Get(':enrollmentId')
  @Roles(Role.ADMIN)
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
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
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
}
