import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath,
  OmitType,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { ToPublishAtDto } from '@/modules/lms/dto/to-publish-at.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { FilterModuleContentsDto } from '@/modules/lms/dto/filter-module-contents.dto';
import { PaginatedModuleContentDto } from '@/modules/lms/dto/paginated-module-content.dto';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { UpdateLessonItemDto } from '@/modules/lms/content/lesson/dto/update-lesson-item.dto';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';
import { UpdateQuizItemDto } from '@/modules/lms/content/quiz/dto/update-quiz-item.dto';
import { UpdateDiscussionItemDto } from '@/modules/lms/content/discussion/dto/update-discussion-item.dto';
import { UpdateFileItemDto } from '@/modules/lms/content/file/dto/update-file-item.dto';
import { UpdateExternalUrlItemDto } from '@/modules/lms/content/url/dto/update-external-url-item.dto';
import { UpdateVideoItemDto } from '@/modules/lms/content/video/dto/update-video-item.dto';
import { ContentType } from '@prisma/client';

@Controller('modules/:moduleId/contents')
export class LmsContentController {
  constructor(
    private readonly lmsContentService: LmsContentService,
    private readonly lmsPublishService: LmsPublishService,
  ) {}

  /**
   * Creates a module content
   *
   * @remarks This operation creates a new module content.
   * Requires `ADMIN` role.
   *
   */
  @ApiCreatedResponse({
    type: OmitType(ModuleContent, ['studentProgress'] as const),
  })
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createModuleContentDto: CreateContentDto,
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
  ): Promise<Omit<ModuleContent, 'studentProgress'>> {
    return this.lmsContentService.create(createModuleContentDto, moduleId);
  }

  /**
   * Retrieve a specific module content by ID
   *
   * @remarks Requires `ADMIN` or `MENTOR` role.
   *
   * @returns ModuleContent if role is `ADMIN` or `MENTOR`
   * @returns StudentContentDto if role is `STUDENT`
   *
   */
  @ApiOkResponse({
    type: ModuleContent,
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(':moduleContentId')
  findOne(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<ModuleContent> {
    const { role, user_id } = user.user_metadata;
    return this.lmsContentService.findOne(moduleContentId, role, user_id);
  }

  /**
   * Update a module content
   *
   * @remarks
   * This operation updates the details of an existing module content.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({
    type: OmitType(ModuleContent, ['studentProgress'] as const),
  })
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @ApiBody({
    // Define the overall schema type as oneOf the possible DTOs
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UpdateLessonItemDto) },
        { $ref: getSchemaPath(UpdateAssignmentDto) },
        { $ref: getSchemaPath(UpdateQuizItemDto) },
        { $ref: getSchemaPath(UpdateDiscussionItemDto) },
        { $ref: getSchemaPath(UpdateFileItemDto) },
        { $ref: getSchemaPath(UpdateExternalUrlItemDto) },
        { $ref: getSchemaPath(UpdateVideoItemDto) },
      ],
      discriminator: {
        propertyName: 'contentType',
        mapping: {
          [ContentType.LESSON]: getSchemaPath(UpdateLessonItemDto),
          [ContentType.ASSIGNMENT]: getSchemaPath(UpdateAssignmentDto),
          [ContentType.QUIZ]: getSchemaPath(UpdateQuizItemDto),
          [ContentType.DISCUSSION]: getSchemaPath(UpdateDiscussionItemDto),
          [ContentType.FILE]: getSchemaPath(UpdateFileItemDto),
          [ContentType.URL]: getSchemaPath(UpdateExternalUrlItemDto),
          [ContentType.VIDEO]: getSchemaPath(UpdateVideoItemDto),
        },
      },
    },
  })
  @Patch(':moduleContentId')
  update(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<Omit<ModuleContent, 'studentProgress'>> {
    return this.lmsContentService.update(moduleContentId, updateContentDto);
  }

  /**
   * Delete a module content
   *
   * @remarks
   * This operation deletes a module content from the system.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          examples: [
            'Module content marked for deletion',
            'Module content permanently deleted',
          ],
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Delete(':moduleContentId')
  remove(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.lmsContentService.remove(moduleContentId, query?.directDelete);
  }

  /**
   * Retrieve multiple module contents based on filters
   *
   */
  @ApiOkResponse({
    type: PaginatedModuleContentDto,
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get()
  findAll(
    @Query() filters: FilterModuleContentsDto,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<PaginatedModuleContentDto> {
    const { role, user_id } = user.user_metadata;
    return this.lmsContentService.findAll(filters, role, user_id);
  }

  /**
   * Publish a module content
   *
   * @remarks
   * This operation publishes a module content.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @Patch(':moduleContentId/publish')
  publish(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @Query() query?: ToPublishAtDto,
  ) {
    return this.lmsPublishService.publishContent(
      moduleContentId,
      query?.toPublishAt,
    );
  }

  /**
   * Unpublish a module content
   *
   * @remarks
   * This operation unpublishes a module content
   * Requires `ADMIN` role.
   */
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @Patch(':moduleContentId/unpublish')
  unpublish(
    @Param(':moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
  ) {
    return this.lmsPublishService.unpublishContent(moduleContentId);
  }

  /**
   * Creates or updates a content progress
   *
   * @remarks
   * Requires `STUDENT` role
   *
   */
  @Post(':moduleContentId/progress')
  @Roles(Role.STUDENT)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  createContentProgress(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsContentService.createContentProgress(
      moduleId,
      moduleContentId,
      user_id,
    );
  }

  /**
   * Retrieves all content progress records for a specific module and user.
   *
   * @remarks
   * - Mentors can fetch progress for a specific student (provide `studentId` query param).
   * - Students can fetch their own progress.
   */
  @Get(':moduleContentId/progress')
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findAllContentProgress(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @CurrentUser() user: CurrentAuthUser,
    @Query('studentId', new ParseUUIDPipe({ optional: true }))
    studentId?: string,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.lmsContentService.findAllContentProgress(
      moduleId,
      user_id,
      role,
      studentId,
    );
  }
}
