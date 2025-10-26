import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
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
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CourseEnrollmentService } from './course-enrollment.service';
import { FinalizeEnrollmentDto } from './dto/finalize-enrollment.dto';
import { PaginatedCourseEnrollmentsDto } from './dto/paginated-course-enrollments.dto';
import { StudentIdentifierDto } from './dto/student-identifier.dto';
import { CourseEnrollmentDto } from '@/generated/nestjs-dto/courseEnrollment.dto';

@Controller('enrollment/student')
export class CourseEnrollmentController {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  /**
   * Retrieve all active (enlisted) course enrollments for the authenticated user.
   *
   * @remarks
   * - `STUDENT` will receive their own enlisted enrollments for the active enrollment period.
   * - `ADMIN` may call this endpoint (typically for inspection); use DTO body to scope to another student when supported.
   * - Each returned record includes a related course offering, course section and mentor/user data.
   *
   * @returns An array of DetailedCourseEnrollmentDto containing the student's active enrollments.
   *
   * @throws BadRequestException - If the request is malformed.
   * @throws NotFoundException - If requested enrollment records or active period cannot be found.
   */
  @ApiException(() => [BadRequestException, NotFoundException])
  @Roles(Role.MENTOR, Role.STUDENT, Role.ADMIN)
  @Get('/sections')
  getCourseEnrollments(@CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;
    return this.courseEnrollmentService.getCourseEnrollments(user_id, role);
  }

  /**
   * Retrieve all course enrollments with optional filters.
   *
   * @remarks
   * - `ADMIN` can retrieve all enrollments and apply filters.
   *
   * @param filters Optional filtering criteria such as page.
   * @returns A paginated response containing the enrollments matching the filter criteria.
   *
   * @throws BadRequestException If the request is malformed.
   * @throws NotFoundException If no enrollment records match the filters.
   */
  @ApiOkResponse({ type: PaginatedCourseEnrollmentsDto })
  @ApiException(() => [BadRequestException, NotFoundException])
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() filters: BaseFilterDto) {
    return this.courseEnrollmentService.findAll(filters);
  }

  /**
   * Enroll a student in a course section.
   *
   * @remarks
   * - `STUDENT` can only enroll themselves.
   * - `ADMIN` can enroll on behalf of another student (using `studentId` in body).
   *
   * @throws BadRequestException If the enrollment period is closed or section full
   * @throws NotFoundException If the course section does not exist
   */
  @ApiCreatedResponse({ type: CourseEnrollmentDto })
  @ApiException(() => [BadRequestException, NotFoundException])
  @Roles(Role.STUDENT, Role.ADMIN)
  @Post('/sections/:sectionId')
  createCourseEnrollment(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: StudentIdentifierDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.courseEnrollmentService.createCourseEnrollment(
      sectionId,
      dto,
      user,
    );
  }

  /**
   * Drop a student from a course section.
   *
   * @remarks
   * - `STUDENT` can only drop themselves.
   * - `ADMIN` can drop on behalf of another student (using `studentId` in body).
   *
   * @throws BadRequestException If `studentId` is missing for ADMIN
   * @throws NotFoundException If enrollment record does not exist or already dropped
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiException(() => [BadRequestException, NotFoundException])
  @Roles(Role.STUDENT, Role.ADMIN)
  @Delete('/sections/:sectionId')
  dropCourseEnrollment(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: StudentIdentifierDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.courseEnrollmentService.dropCourseEnrollment(
      sectionId,
      dto,
      user,
    );
  }

  /**
   * Finalize all course enrollments for a student.
   *
   * @remarks
   * - Sets all enrolled courses for the student to `finalized`.
   * - `STUDENT` can finalize only their own enrollments.
   * - `ADMIN` can finalize for any student by providing `studentId` in the request body.
   *
   * @throws BadRequestException If there are no enrolled courses to finalize
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        studentId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiException(() => [BadRequestException])
  @Roles(Role.STUDENT, Role.ADMIN)
  @Post('/finalize')
  finalizeCourseEnrollment(
    @CurrentUser() user: CurrentAuthUser,
    @Body() dto: FinalizeEnrollmentDto,
  ) {
    return this.courseEnrollmentService.finalizeEnrollment(user, dto);
  }
}
