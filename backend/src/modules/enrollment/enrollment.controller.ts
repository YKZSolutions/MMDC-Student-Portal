import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { PaginatedCourseOfferingsDto } from './dto/paginated-courseOffering.dto';
import { PaginatedCourseSectionsDto } from './dto/paginated-courseSections.dto';
import { PaginatedEnrollmentPeriodsDto } from './dto/paginated-enrollmentPeriod.dto';
import { UpdateCourseSectionDto } from './dto/update-courseSection.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';
import { EnrollmentService } from './enrollment.service';

@Roles(Role.ADMIN)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  /**
   * Creates a new enrollment period
   *
   * @remarks
   * This operation creates a new enrollment period for managing course registrations.
   * Requires `ADMIN` role.
   */
  @ApiCreatedResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [BadRequestException])
  @Post()
  createEnrollment(@Body() dto: CreateEnrollmentPeriodDto) {
    return this.enrollmentService.createEnrollment(dto);
  }

  /**
   * Creates a new course offering under a specific enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment period or course does not exist
   * @throws BadRequestException If invalid references are provided
   */
  @ApiCreatedResponse({ type: CourseOfferingDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Post('/:periodId/offerings')
  createCourseOffering(
    @Param('periodId') periodId: string,
    @Body() dto: CreateCourseOfferingDto,
  ) {
    return this.enrollmentService.createCourseOffering(periodId, dto);
  }

  /**
   * Creates a new course section under a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the course offering or mentor does not exist
   * @throws BadRequestException If invalid references are provided
   */
  @ApiCreatedResponse({ type: CourseSectionDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Post('/offerings/:offeringId/sections')
  createCourseSection(
    @Param('offeringId') offeringId: string,
    @Body() dto: CreateCourseSectionFullDto,
  ) {
    return this.enrollmentService.createCourseSection(offeringId, dto);
  }

  /**
   * Retrieves all enrollment periods
   *
   * @remarks
   * Fetches a paginated list of enrollment periods.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: PaginatedEnrollmentPeriodsDto })
  @ApiException(() => [BadRequestException])
  @Get()
  findAllEnrollments(@Query() filters: BaseFilterDto) {
    return this.enrollmentService.findAllEnrollments(filters);
  }

  /**
   * Retrieves all course offerings
   *
   * @remarks
   * Fetches a paginated list of course offerings.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: PaginatedCourseOfferingsDto })
  @ApiException(() => [BadRequestException])
  @Get('/offerings')
  findAllCourseOfferings(@Query() filters: BaseFilterDto) {
    return this.enrollmentService.findAllCourseOfferings(filters);
  }

  /**
   * Retrieves all course sections
   *
   * @remarks
   * Fetches a paginated list of course sections.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: PaginatedCourseSectionsDto })
  @ApiException(() => [BadRequestException])
  @Get('/sections')
  findAllCourseSections(@Query() filters: BaseFilterDto) {
    return this.enrollmentService.findAllCourseSections(filters);
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
  @ApiOkResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Get(':id')
  findOneEnrollment(@Param('id') id: string) {
    return this.enrollmentService.findOneEnrollment(id);
  }

  /**
   * Retrieves a specific course offering by ID
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the offering does not exist
   * @throws BadRequestException If ID format is invalid
   */
  @ApiOkResponse({ type: CourseOfferingDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Get('/offerings/:offeringId')
  findOneCourseOffering(@Param('offeringId') offeringId: string) {
    return this.enrollmentService.findOneCourseOffering(offeringId);
  }

  /**
   * Retrieves a specific course section under a course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section or offering does not exist
   * @throws BadRequestException If ID format is invalid
   */
  @ApiOkResponse({ type: CourseSectionDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Get('/offerings/:offeringId/sections/:sectionId')
  findOneCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollmentService.findOneCourseSection(offeringId, sectionId);
  }

  /**
   * Updates the status of an enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment does not exist
   */
  @ApiOkResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [NotFoundException])
  @Patch('/:id/status')
  updateEnrollmentStatus(
    @Param('id') id: string,
    @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentService.updateEnrollmentStatus(
      id,
      updateEnrollmentStatusDto,
    );
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
  @ApiOkResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Patch(':id')
  updateEnrollment(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.updateEnrollment(id, updateEnrollmentDto);
  }

  /**
   * Updates a course section under a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section does not exist
   * @throws BadRequestException If invalid relations or closed enrollment
   */
  @ApiOkResponse({ type: CourseSectionDto })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Patch('/offerings/:offeringId/sections/:sectionId')
  updateCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
    @Body() updateCourseSectionDto: UpdateCourseSectionDto,
  ) {
    return this.enrollmentService.updateCourseSection(
      offeringId,
      sectionId,
      updateCourseSectionDto,
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
  @Delete(':id')
  removeEnrollment(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.enrollmentService.removeEnrollment(id, query?.directDelete);
  }

  /**
   * Removes a course offering from a specific enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the course offering does not exist
   * @throws BadRequestException If enrollment is closed or offering is referenced
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Delete(':periodId/offerings/:offeringId')
  removeCourseOffering(
    @Param('periodId') periodId: string,
    @Param('offeringId') offeringId: string,
  ) {
    return this.enrollmentService.removeCourseOffering(periodId, offeringId);
  }

  /**
   * Removes a course section from a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section does not exist
   * @throws BadRequestException If enrollment is closed or section is referenced
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Delete('offerings/:offeringId/sections/:sectionId')
  removeCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollmentService.removeCourseSection(offeringId, sectionId);
  }
}
