import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GradingService } from './grading.service';
import { GradebookFilterDto } from './dto/gradebook-filter.dto';
import {
  GradebookForStudentDto,
  GradebookForMentorDto,
} from './dto/studentGradebookDto';
import { GradeAssignmentSubmissionDto } from './dto/grade-assignment-submission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { UpdateGradeRecordDto } from '@/generated/nestjs-dto/update-gradeRecord.dto';
import { GradeRecord } from '@/generated/nestjs-dto/gradeRecord.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  /**
   * Retrieve gradebook for the current student
   *
   * @remarks
   * Returns the gradebook for the authenticated student user.
   * Only shows grades for assignments the student has submitted.
   * Requires `STUDENT` role.
   *
   * @param user - The authenticated user
   * @param filters - Query filters for pagination and filtering
   */
  @Get('gradebook/student')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Get student gradebook',
    description:
      'Retrieves the gradebook for the authenticated student showing their grades for submitted assignments',
  })
  @ApiOkResponse({
    description: 'Student gradebook retrieved successfully',
    type: GradebookForStudentDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  getStudentGradebook(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: GradebookFilterDto,
  ): Promise<GradebookForStudentDto> {
    const { user_id } = user.user_metadata;
    return this.gradingService.getStudentGradebook(user_id, filters);
  }

  /**
   * Retrieve gradebook for mentor's students
   *
   * @remarks
   * Returns the gradebook data for all students in courses the mentor is assigned to.
   * Requires `MENTOR` role.
   *
   * @param user - The authenticated user
   * @param filters - Query filters for pagination and filtering
   */
  @Get('gradebook/mentor')
  @Roles(Role.MENTOR)
  @ApiOperation({
    summary: 'Get mentor gradebook',
    description:
      'Retrieves gradebook data for all students in courses the mentor is assigned to',
  })
  @ApiOkResponse({
    description: 'Mentor gradebook retrieved successfully',
    type: GradebookForMentorDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
  ])
  getMentorGradebook(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: GradebookFilterDto,
  ): Promise<GradebookForMentorDto> {
    const { user_id } = user.user_metadata;
    return this.gradingService.getMentorGradebook(user_id, filters);
  }

  /**
   * Retrieve gradebook for admin
   *
   * @remarks
   * Returns gradebook data across all courses and students in the system.
   * Requires `ADMIN` role.
   *
   * @param filters - Query filters for pagination and filtering
   */
  @Get('gradebook/admin')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get admin gradebook',
    description:
      'Retrieves gradebook data across all courses and students in the system',
  })
  @ApiOkResponse({
    description: 'Admin gradebook retrieved successfully',
    type: GradebookForMentorDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  getAdminGradebook(
    @Query() filters: GradebookFilterDto,
  ): Promise<GradebookForMentorDto> {
    return this.gradingService.getAdminGradebook(filters);
  }

  /**
   * Grade an assignment submission
   *
   * @remarks
   * Allows mentors to grade student assignment submissions.
   * Creates a new grade record for the submission.
   * Requires `MENTOR` role.
   *
   * @param submissionId - The UUID of the assignment submission to grade
   * @param user - The authenticated user (mentor)
   * @param dto - Grade assignment data including raw score, feedback, and rubric details
   */
  @Post('submissions/:submissionId/grade')
  @Roles(Role.MENTOR)
  @ApiOperation({
    summary: 'Grade assignment submission',
    description: 'Creates a grade record for a student assignment submission',
  })
  @ApiOkResponse({
    description: 'Assignment graded successfully',
    type: GradeRecordDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  ])
  gradeAssignmentSubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @CurrentUser() user: CurrentAuthUser,
    @Body() dto: GradeAssignmentSubmissionDto,
  ): Promise<GradeRecordDto> {
    const { user_id } = user.user_metadata;
    return this.gradingService.gradeAssignmentSubmission(
      submissionId,
      user_id,
      dto,
    );
  }

  /**
   * Update an existing grade record
   *
   * @remarks
   * Allows mentors to update existing grade records for assignments.
   * Requires `MENTOR` role and permission to grade the student.
   *
   * @param recordId - The UUID of the grade record to update
   * @param user - The authenticated user (mentor)
   * @param dto - Updated grade data
   */
  @Patch('grade-records/:recordId')
  @Roles(Role.MENTOR)
  @ApiOperation({
    summary: 'Update grade record',
    description:
      'Updates an existing grade record for an assignment submission',
  })
  @ApiOkResponse({
    description: 'Grade record updated successfully',
    type: GradeRecord,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
  ])
  updateGradeRecord(
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
    @CurrentUser() user: CurrentAuthUser,
    @Body() dto: UpdateGradeRecordDto,
  ): Promise<GradeRecord> {
    const { user_id } = user.user_metadata;
    return this.gradingService.updateGradeRecord(recordId, user_id, dto);
  }
}
