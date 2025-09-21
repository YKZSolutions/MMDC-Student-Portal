import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { FilterTodosDto } from '@/modules/lms/dto/filter-todos.dto';
import { ModuleTreeDto } from '@/modules/lms/dto/module-tree.dto';
import { PaginatedTodosDto } from '@/modules/lms/dto/paginated-todos.dto';
import { ToPublishAtDto } from '@/modules/lms/dto/to-publish-at.dto';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { LmsService } from '@/modules/lms/lms.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

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


  /**
   * Retrieve all modules for students
   *
   * @remarks
   * Returns a paginated list of modules for the current student user.
   * Only modules from courses the student is enrolled in are included.
   * Requires `STUDENT` role.
   *
   * @param user - The authenticated user
   * @param filters - Query filters for pagination and search
   */
  @Get('student')
  @Roles(Role.STUDENT)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAllForStudent(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: BaseFilterDto,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsService.findAllForStudent(user_id, filters);
  }


  /**
   * Retrieve all modules for mentors
   *
   * @remarks
   * Returns a paginated list of modules for the current mentor user.
   * Only modules from courses the mentor is assigned to are included.
   * Requires `MENTOR` role.
   *
   * @param user - The authenticated user
   * @param filters - Query filters for pagination and search
   */
  @Get('mentor')
  @Roles(Role.MENTOR)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAllForMentor(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: BaseFilterDto,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsService.findAllForMentor(user_id, filters);
  }


  /**
   * Retrieve all modules for admins
   *
   * @remarks
   * Returns a paginated list of all modules across all courses.
   * Requires `ADMIN` role.
   *
   * @param user - The authenticated user
   * @param filters - Query filters for pagination and search
   */
  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAllForAdmin(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: BaseFilterDto,
  ) {
    const { user_id } = user.user_metadata;
    return this.lmsService.findAllForAdmin(user_id, filters);
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
  findTodos(
    @CurrentUser() user: CurrentAuthUser,
    @Query() filters: FilterTodosDto,
  ): Promise<PaginatedTodosDto> {
    const { user_id } = user.user_metadata;
    return this.lmsContentService.findTodos(user_id, filters);
  }

  /**
   * Retrieves the complete module tree structure
   *
   * @remarks
   * Fetches a module with its complete hierarchical structure including sections, subsections,
   * and all associated content items (lessons, assignments, quizzes, etc.).
   * For students, it also includes their progress on each content item.
   *
   * @param id - The UUID of the module to retrieve
   * @param user - The authenticated user making the request
   * @returns A Promise that resolves to the complete module tree structure
   */
  @Get(':id/tree')
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiOperation({
    summary: 'Get module tree structure',
    description:
      'Retrieves the complete hierarchical structure of a module including all sections and content items',
  })
  @ApiOkResponse({
    description: 'Module tree retrieved successfully',
    type: ModuleTreeDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  async findModuleTree(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentAuthUser,
  ): Promise<ModuleTreeDto> {
    const { role, user_id } = user.user_metadata;
    return this.lmsContentService.findModuleTree(id, role, user_id);
  }
}
