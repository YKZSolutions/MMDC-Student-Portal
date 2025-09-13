import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LmsSectionService } from '@/modules/lms/lms-section.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CreateModuleSectionDto } from './dto/create-module-section.dto';
import { UpdateModuleSectionDto } from './dto/update-module-section.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';

@Controller('modules/:moduleId/sections')
export class LmsSectionController {
  constructor(private readonly lmsSectionService: LmsSectionService) {}

  /**
   * Creates a new module section
   *
   * @remarks
   * Requires `ADMIN` role
   *
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  create(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Body() dto: CreateModuleSectionDto,
  ) {
    return this.lmsSectionService.create(moduleId, dto);
  }

  /**
   * Retrieves module sections of the given module id
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAllModuleSections(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
  ) {
    return this.lmsSectionService.findByModuleId(moduleId);
  }

  /**
   * Updates a module section
   *
   * @remarks
   * Requires `ADMIN` role
   */
  @Patch(':moduleSectionId')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  update(
    @Param('moduleSectionId', new ParseUUIDPipe()) moduleSectionId: string,
    @Body() dto: UpdateModuleSectionDto,
  ) {
    return this.lmsSectionService.update(moduleSectionId, dto);
  }

  /**
   * Deletes a module section
   *
   * @remarks
   * Requires `ADMIN` role
   */
  @Delete(':moduleSectionId')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  remove(
    @Param('moduleSectionId', new ParseUUIDPipe()) moduleSectionId: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.lmsSectionService.remove(moduleSectionId, query?.directDelete);
  }
}
