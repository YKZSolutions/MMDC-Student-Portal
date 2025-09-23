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
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CreateQuizSubmissionDto } from '@/generated/nestjs-dto/create-quizSubmission.dto';
import { QuizSubmissionService } from '@/modules/lms/content/quiz/quiz-submission.service';
import { UpdateQuizSubmissionDto } from '@/generated/nestjs-dto/update-quizSubmission.dto';
import { ReturnForRevisionDto } from '@/modules/lms/dto/resubmision.dto';

@Controller('quizzes')
@ApiException(() => [
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
])
export class QuizSubmissionController {
  constructor(private readonly quizSubmissionService: QuizSubmissionService) {}

  @Post(':quizId')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  ])
  async createQuizSubmission(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuizSubmissionDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.quizSubmissionService.create(quizId, user_id, dto);
  }

  @Put(':quizId/submission/:submissionId')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  ])
  async updateQuizSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: UpdateQuizSubmissionDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.quizSubmissionService.update(submissionId, user_id, dto);
  }

  @Post(':quizId/submission/:submissionId/finalize')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  ])
  async finalizeQuizSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.quizSubmissionService.finalizeSubmission(submissionId, user_id);
  }

  @Get(':quizId/submission/:submissionId')
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  ])
  async getQuizSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.quizSubmissionService.findById(submissionId, role, user_id);
  }

  @Get(':quizId/submission/')
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  ])
  async getQuizSubmissions(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.quizSubmissionService.findByQuiz(quizId, role, user_id);
  }

  @Patch(':quizId/submission/:submissionId/return')
  @Roles(Role.MENTOR, Role.ADMIN)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async returnQuizSubmissionForRevision(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body('feedback') feedback?: ReturnForRevisionDto,
  ) {
    return this.quizSubmissionService.returnForRevision(
      submissionId,
      feedback?.feedback,
    );
  }

  @Patch(':quizId/submission/:submissionId/resubmit')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async startQuizResubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.quizSubmissionService.startResubmission(submissionId);
  }
}
