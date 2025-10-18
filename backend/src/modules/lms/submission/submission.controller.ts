import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { SubmissionService } from './submission.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { CreateAssignmentSubmissionDto } from '@/generated/nestjs-dto/create-assignmentSubmission.dto';
import { AssignmentSubmissionDetailsDto } from '@/modules/lms/submission/dto/paginated-submission.dto';

@Controller('modules/:moduleId/submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('/assignment/:moduleContentId')
  @Roles(Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  submitAssignment(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() user: CurrentAuthUser,
    @Body() assignmentSubmissionDto: CreateAssignmentSubmissionDto,
  ) {
    const { user_id } = user.user_metadata;
    return this.submissionService.createAssignmentSubmission(
      moduleContentId,
      user_id,
      assignmentSubmissionDto,
    );
  }

  @Patch(':submissionId')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  grade(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
  ) {
    return this.submissionService.grade(submissionId, gradeDto);
  }

  @Get(':submissionId')
  @Roles(Role.MENTOR, Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findOne(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
  ): Promise<AssignmentSubmissionDetailsDto> {
    return this.submissionService.findById(submissionId);
  }

  @Get('/assignment/:moduleContentId')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  findAssignmentSubmissionsForAssignment(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    return this.submissionService.findByAssignment(moduleContentId);
  }

  @Get('/assignment/student/:studentId')
  @Roles(Role.MENTOR, Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findAssignmentSubmissionsOfStudent(
    @Param('studentId', new ParseUUIDPipe()) studentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    const { user_id, role } = user.user_metadata;
    if (role === 'student' && user_id !== studentId)
      throw new UnauthorizedException(
        'You are not allowed to view submissions of other students',
      );
    const resolvedStudentId = role === 'student' ? user_id : studentId;
    return this.submissionService.findByStudent(resolvedStudentId);
  }

  @Get('/assignment/:moduleContentId/student/:studentId')
  @Roles(Role.MENTOR, Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findAssignmentSubmissionsOfStudentForAssignment(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @Param('studentId', new ParseUUIDPipe()) studentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<AssignmentSubmissionDetailsDto[]> {
    const { user_id, role } = user.user_metadata;
    if (role === 'student' && user_id !== studentId)
      throw new UnauthorizedException(
        'You are not allowed to view submissions of other students',
      );
    const resolvedStudentId = role === 'student' ? user_id : studentId;
    return this.submissionService.findByAssignmentAndStudent(
      moduleContentId,
      resolvedStudentId,
    );
  }
}
