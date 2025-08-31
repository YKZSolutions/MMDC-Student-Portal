import { Role } from '@/common/enums/roles.enum';
import { CourseEnrollmentService } from './courseEnrollment.service';
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
import { Roles } from '@/common/decorators/roles.decorator';
import { StudentIdentifierDto } from './dto/studentIdentifier.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('enrollment/student')
export class CourseEnrollmentController {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

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
    @CurrentUser() user: AuthUser,
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
    @CurrentUser() user: AuthUser,
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
    @Body() dto: StudentIdentifierDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.courseEnrollmentService.finalizeEnrollment(dto, user);
  }
}
