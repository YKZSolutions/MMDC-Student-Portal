import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { StudentContentDto } from '@/modules/lms/dto/student-content.dto';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { UpdatePublishDto } from '@/modules/lms/dto/update-publish.dto';

@Controller('lms/:lmsId/contents/') //TODO: configure pathing
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
  @ApiCreatedResponse({ type: ModuleContentDto })
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createModuleContentDto: CreateContentDto,
    @Param('lmsId') lmsId: string,
  ) {
    console.log('lmsId', lmsId);
    return this.lmsContentService.create(createModuleContentDto, lmsId);
  }

  /**
   * Retrieve a specific module content by ID
   *
   * @remarks Requires `ADMIN` or `MENTOR` role.
   *
   * @returns ModuleContentDto if role is `ADMIN` or `MENTOR`
   * @returns StudentContentDto if role is `STUDENT`
   *
   */
  @ApiExtraModels(ModuleContentDto, StudentContentDto)
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ModuleContentDto) },
        { $ref: getSchemaPath(StudentContentDto) },
      ],
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<ModuleContentDto | StudentContentDto> {
    const { role, user_id } = user.user_metadata;
    return this.lmsContentService.findOne(id, role, user_id);
  }

  /**
   * Update a module content
   *
   * @remarks
   * This operation updates the details of an existing module content.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: ModuleContentDto })
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsContentService.update(id, updateContentDto, user_id);
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
  @Delete(':id')
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.lmsContentService.remove(id, query?.directDelete);
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
  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @Body() updatePublishDto: UpdatePublishDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsPublishService.publishContent(id, updatePublishDto, user_id);
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
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.lmsPublishService.unpublishContent(id);
  }
}
