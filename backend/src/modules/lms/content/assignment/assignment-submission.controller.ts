import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Patch,
} from '@nestjs/common';
import { AssignmentSubmissionService } from '@/modules/lms/content/assignment/assignment-submission.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { SubmitAssignmentDto } from '@/modules/lms/dto/submit-assignment.dto';
import { UpdateAssignmentSubmissionDto } from '@/generated/nestjs-dto/update-assignmentSubmission.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('assignments')
@ApiException(() => [
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
])
export class AssignmentSubmissionController {
  constructor(
    private readonly assignmentSubmissionService: AssignmentSubmissionService,
  ) {}

  @Post(':assignmentId/submit')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  ])
  async createAssignmentSubmission(
    @Param('assignmentId', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.assignmentSubmissionService.create(id, user_id, dto);
  }

  @Put(':assignmentId/submission/:submissionId')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  ])
  async updateAssignmentSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: UpdateAssignmentSubmissionDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.assignmentSubmissionService.update(submissionId, user_id, dto);
  }

  @Post(':assignmentId/submission/:submissionId/finalize')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async finalizeAssignmentSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.assignmentSubmissionService.finalizeSubmission(
      submissionId,
      user_id,
    );
  }

  @Get(':assignmentId/submission/:submissionId')
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  async getAssignmentSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.assignmentSubmissionService.findById(
      submissionId,
      role,
      user_id,
    );
  }

  @Get(':assignmentId/submissions')
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  async getAssignmentSubmissions(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;

    return this.assignmentSubmissionService.findByAssignment(
      assignmentId,
      role,
      user_id,
    );
  }

  @Patch(':assignmentId/submission/:submissionId/return')
  @Roles(Role.MENTOR, Role.ADMIN)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async returnAssignmentSubmissionForRevision(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body('feedback') feedback?: string,
  ) {
    return this.assignmentSubmissionService.returnForRevision(
      submissionId,
      feedback,
    );
  }

  @Patch(':assignmentId/submission/:submissionId/resubmit')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async startAssignmentResubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.assignmentSubmissionService.startResubmission(submissionId);
  }
}
