import {
  BadRequestException,
  Body,
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
import { LmsService } from '@/modules/lms/lms.service';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaginatedTodosDto } from '@/modules/lms/dto/paginated-todos.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { ToPublishAtDto } from '@/modules/lms/dto/to-publish-at.dto';

@Controller('modules')
export class LmsController {
  constructor(
    private readonly lmsService: LmsService,
    private readonly lmsPublishService: LmsPublishService,
    private readonly lmsContentService: LmsContentService,
  ) {}

  /**
   * Retrieve all modules
   *
   * @remarks
   * Retrieves a paginated list of modules based on the user role and provided filters.
   *
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAll(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: BaseFilterDto,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.lmsService.findAll(user_id, role, filters);
  }

  /**
   * Updates a module
   *
   * @remarks
   * This operation updates the details of an existing module.
   * Requires `ADMIN` role.
   *
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.lmsService.update(id, dto);
  }

  /**
   * Deletes a module
   *
   * @remarks
   * This operation deletes a module from the system.
   * Requires `ADMIN` role.
   *
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Module deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.lmsService.remove(id, query?.directDelete);
  }

  /**
   * Publishes a module
   *
   * @remarks
   * Publishes a module with an optional date.
   * Requires `ADMIN` role.
   *
   * @param id - The UUID of the module to publish.
   * @param query - The optional date to publish the module at.
   * @returns A Promise that resolves to an object with a message.
   */
  @Post(':id/publish')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: ToPublishAtDto,
  ): Promise<{ message: string }> {
    return this.lmsPublishService.publishModule(id, query?.toPublishAt);
  }

  /**
   * Unpublishes a module
   *
   * @remarks
   * Unpublishes a module.
   * Requires `ADMIN` role.
   *
   * @param id - The UUID of the module to unpublish.
   * @returns A Promise that resolves to an object with a message.
   */
  @Post(':id/unpublish')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  unpublish(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.lmsPublishService.unpublishModule(id);
  }

  /**
   * Retrieve multiple todos
   *
   * @remarks Requires `STUDENT` role.
   *
   *
   */
  @ApiOkResponse({
    type: ModuleContent,
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.STUDENT)
  @Get('/todo')
  findTodos(@CurrentUser() user: CurrentAuthUser): Promise<PaginatedTodosDto> {
    const { user_id } = user.user_metadata;
    return this.lmsContentService.findTodos(user_id);
  }
}
