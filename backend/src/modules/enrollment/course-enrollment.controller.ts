import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CourseEnrollmentService } from './course-enrollment.service';
import { StudentIdentifierDto } from './dto/student-identifier.dto';

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
   * - Each returned record includes related course offering, course section and mentor/user data.
   *
   * @returns An array of DetailedCourseEnrollmentDto containing the student's active enrollments.
   *
   * @throws BadRequestException - If the request is malformed.
   * @throws NotFoundException - If requested enrollment records or active period cannot be found.
   */
  @ApiException(() => [BadRequestException, NotFoundException])
  @Roles(Role.MENTOR, Role.STUDENT, Role.ADMIN)
  @Post('/sections')
  getCourseEnrollments(@CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;
    return this.courseEnrollmentService.getCourseEnrollments(user_id, role);
  }

  /**
   * Enroll a student in a course section.
   *
   * @remarks
   * - `STUDENT` can only enroll themselves.
   * - `ADMIN` can enroll on behalf of another student (using `studentId` in body).
   *
   * @throws BadRequestException If enrollment period is closed or section full
   * @throws NotFoundException If course section does not exist
   */
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
  @ApiBody({ required: false, type: StudentIdentifierDto })
  @Roles(Role.STUDENT, Role.ADMIN)
  @Post('/finalize')
  finalizeCourseEnrollment(
    @CurrentUser() user: CurrentAuthUser,
    @Body() dto?: StudentIdentifierDto,
  ) {
    return this.courseEnrollmentService.finalizeEnrollment(user, dto);
  }
}
