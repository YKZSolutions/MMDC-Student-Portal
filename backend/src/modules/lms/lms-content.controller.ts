import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('modules/:moduleId/contents')
export class LmsContentController {
  constructor(private readonly lmsContentService: LmsContentService) {}

  /**
   * Creates or updates a content progress
   *
   * @remarks
   * Requires `STUDENT` role
   *
   */
  @Post(':moduleContentId')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  createContentProgress(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.lmsContentService.createContentProgress(
      moduleId,
      moduleContentId,
      user,
    );
  }

  /**
   * Retrieves all content progress records for a specific module and user.
   *
   * @remarks
   * - Mentors can fetch progress for a specific student (provide `studentId` query param).
   * - Students can fetch their own progress.
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findAllContentProgress(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Query('studentId', new ParseUUIDPipe({ optional: true }))
    studentId: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.lmsContentService.findAllContentProgress(
      moduleId,
      studentId,
      user,
    );
  }
}
