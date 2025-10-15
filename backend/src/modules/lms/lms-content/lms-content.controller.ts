import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { FilterModuleContentsDto } from '@/modules/lms/lms-content/dto/filter-module-contents.dto';
import { PaginatedModuleContentDto } from '@/modules/lms/lms-content/dto/paginated-module-content.dto';
import {
  UpdateAssignmentItemDto,
  UpdateLessonItemDto,
} from '@/modules/lms/lms-content/dto/update-full-module-content.dto';
import { LmsContentService } from '@/modules/lms/lms-content/lms-content.service';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import {
  AssignmentItemDto,
  LessonItemDto,
} from './dto/full-module-content.dto';
import {
  FullModuleContent,
  UpdateFullModuleContent,
} from '@/modules/lms/lms-content/types';

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
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LessonItemDto) },
        { $ref: getSchemaPath(AssignmentItemDto) },
      ],
      discriminator: {
        propertyName: 'contentType',
        mapping: {
          [ContentType.LESSON]: getSchemaPath(LessonItemDto),
          [ContentType.ASSIGNMENT]: getSchemaPath(AssignmentItemDto),
        },
      },
    },
  })
  @ApiExtraModels(AssignmentItemDto, LessonItemDto)
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createModuleContentDto: CreateModuleContentDto,
  ): Promise<FullModuleContent> {
    return this.lmsContentService.create(createModuleContentDto);
  }

  /**
   * Retrieve a specific module content by ID
   *
   *
   */
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LessonItemDto) },
        { $ref: getSchemaPath(AssignmentItemDto) },
      ],
      discriminator: {
        propertyName: 'contentType',
        mapping: {
          [ContentType.LESSON]: getSchemaPath(LessonItemDto),
          [ContentType.ASSIGNMENT]: getSchemaPath(AssignmentItemDto),
        },
      },
    },
  })
  @ApiExtraModels(AssignmentItemDto, LessonItemDto)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(':moduleContentId')
  findOne(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<FullModuleContent> {
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
    type: ModuleContent,
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
        { $ref: getSchemaPath(UpdateAssignmentItemDto) },
      ],
      discriminator: {
        propertyName: 'contentType',
        mapping: {
          [ContentType.LESSON]: getSchemaPath(UpdateLessonItemDto),
          [ContentType.ASSIGNMENT]: getSchemaPath(UpdateAssignmentItemDto),
        },
      },
    },
  })
  @ApiExtraModels(UpdateAssignmentItemDto, UpdateLessonItemDto)
  @Patch(':moduleContentId')
  update(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @Body() updateContentDto: UpdateFullModuleContent,
  ): Promise<FullModuleContent> {
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
  @ApiExtraModels(UpdateAssignmentItemDto, UpdateLessonItemDto)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get()
  findAll(
    @Query() filters: FilterModuleContentsDto,
  ): Promise<PaginatedModuleContentDto> {
    return this.lmsContentService.findAll(filters);
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
  ) {
    return this.lmsPublishService.publishContent(moduleContentId);
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
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
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
