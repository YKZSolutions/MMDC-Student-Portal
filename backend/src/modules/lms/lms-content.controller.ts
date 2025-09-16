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
import { ApiCreatedResponse, ApiOkResponse, OmitType } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import {
  AuthUser,
  CurrentAuthUser,
} from '@/common/interfaces/auth.user-metadata';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { UpdatePublishDto } from '@/modules/lms/dto/update-publish.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { FilterModuleContentsDto } from '@/modules/lms/dto/filter-module-contents.dto';
import { PaginatedModuleContentDto } from '@/modules/lms/dto/paginated-module-content.dto';

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
    type: ModuleContent,
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get()
  findAll(
    @Body() filters: FilterModuleContentsDto,
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
    @Body() updatePublishDto: UpdatePublishDto,
  ) {
    return this.lmsPublishService.publishContent(
      moduleContentId,
      updatePublishDto,
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
