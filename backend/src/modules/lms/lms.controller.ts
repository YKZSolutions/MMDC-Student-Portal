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
  Query,
} from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import {
  AuthUser,
  CurrentAuthUser,
} from '@/common/interfaces/auth.user-metadata';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaginatedTodosDto } from '@/modules/lms/dto/paginated-todos.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

@Controller('modules')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

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
  findAll(@CurrentUser() user: AuthUser, @Query() filters: BaseFilterDto) {
    return this.lmsService.findAll(user, filters);
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
    return this.lmsService.findTodos(user_id);
  }
}
