import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { UpdateCourseSectionDto } from './dto/update-courseSection.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { PaginatedEnrollmentPeriodsDto } from './dto/paginated-enrollmentPeriod.dto';
import { PaginatedCourseOfferingsDto } from './dto/paginated-courseOffering.dto';
import { PaginatedCourseSectionsDto } from './dto/paginated-courseSections.dto';
import { StudentIdentifierDto } from './dto/studentIdentifier.dto';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // ===========================================================================
  // ENROLLMENT PERIOD
  // ===========================================================================

  /**
   * Creates a new enrollment period
   *
   * @remarks
   * This operation creates a new enrollment period for managing course registrations.
   * Requires `ADMIN` role.
   */
  @ApiCreatedResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN)
  @Post('/periods')
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
  @ApiOkResponse({ type: PaginatedEnrollmentPeriodsDto })
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN)
  @Get('/periods')
  findAllEnrollments(@Query() filters: BaseFilterDto) {
    return this.enrollmentService.findAllEnrollments(filters);
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
  @Roles(Role.ADMIN)
  @Get('/periods/:periodId')
  findOneEnrollment(@Param('periodId', new ParseUUIDPipe()) periodId: string) {
    return this.enrollmentService.findOneEnrollment(periodId);
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
  @Roles(Role.ADMIN)
  @Patch('/periods/:periodId')
  updateEnrollment(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.updateEnrollment(
      periodId,
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
  @ApiOkResponse({ type: EnrollmentPeriodDto })
  @ApiException(() => [NotFoundException])
  @Roles(Role.ADMIN)
  @Patch('periods/:periodId/status')
  updateEnrollmentStatus(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentService.updateEnrollmentStatus(
      periodId,
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
  @Delete('/periods/:periodId')
  removeEnrollment(@Param('periodId', new ParseUUIDPipe()) periodId: string) {
    return this.enrollmentService.removeEnrollment(periodId);
  }

  // ===========================================================================
  // COURSE OFFERINGS
  // ===========================================================================
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
  @Roles(Role.ADMIN)
  @Post('/periods/:periodId/offerings')
  createCourseOffering(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Body() dto: CreateCourseOfferingDto,
  ) {
    return this.enrollmentService.createCourseOffering(periodId, dto);
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
  @Roles(Role.ADMIN)
  @Get('/offerings')
  findAllCourseOfferings(@Query() filters: BaseFilterDto) {
    return this.enrollmentService.findAllCourseOfferings(filters);
  }

  /**
   * Retrieves all course offerings in a specific enrollment period
   *
   * @remarks
   * Fetches a paginated list of course offerings for the given period.
   * Requires `ADMIN` or `STUDENT` role.
   */
  @ApiOkResponse({ type: PaginatedCourseOfferingsDto })
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('/periods/:periodId/offerings')
  findCourseOfferingsByPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.enrollmentService.findAllCourseOfferings(filters, periodId);
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
  @Roles(Role.ADMIN)
  @Get('/offerings/:offeringId')
  findOneCourseOffering(
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
  ) {
    return this.enrollmentService.findOneCourseOffering(offeringId);
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
  @Roles(Role.ADMIN)
  @Delete('/periods/:periodId/offerings/:offeringId')
  removeCourseOffering(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
  ) {
    return this.enrollmentService.removeCourseOffering(periodId, offeringId);
  }

  // ===========================================================================
  // COURSE SECTIONS
  // ===========================================================================

  /**
   * Retrieves all course sections
   *
   * @remarks
   * Fetches a paginated list of course sections.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: PaginatedCourseSectionsDto })
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('periods/:periodId/sections')
  findAllCourseSections(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.enrollmentService.findAllCourseSections(filters);
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
  @Roles(Role.ADMIN)
  @Post('/offerings/:offeringId/sections')
  createCourseSection(
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Body() dto: CreateCourseSectionFullDto,
  ) {
    return this.enrollmentService.createCourseSection(offeringId, dto);
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
  @Roles(Role.ADMIN)
  @Get('/offerings/:offeringId/sections/:sectionId')
  findOneCourseSection(
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
  ) {
    return this.enrollmentService.findOneCourseSection(offeringId, sectionId);
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @Delete('offerings/:offeringId/sections/:sectionId')
  removeCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollmentService.removeCourseSection(offeringId, sectionId);
  }

  // ===========================================================================
  // STUDENT ENROLLMENT
  // ===========================================================================
  @Roles(Role.STUDENT, Role.ADMIN)
  @Post('/sections/:sectionId/enroll')
  createCourseEnrollment(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: StudentIdentifierDto,
  ) {
    return this.enrollmentService.createCourseEnrollment(sectionId, dto);
  }

  @Roles(Role.STUDENT, Role.ADMIN)
  @Delete('/sections/:sectionId')
  dropCourseEnrollment(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: StudentIdentifierDto,
  ) {
    return this.enrollmentService.dropCourseEnrollment(sectionId, dto);
  }

  @Roles(Role.STUDENT, Role.ADMIN)
  @Post('/enrollment/finalize')
  finalizeCourseEnrollment(@Body() dto: StudentIdentifierDto) {
    return this.enrollmentService.finalizeEnrollment(dto);
  }
}
