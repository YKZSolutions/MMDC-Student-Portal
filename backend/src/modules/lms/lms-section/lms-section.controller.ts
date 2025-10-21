import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
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
import { CreateModuleSectionDto } from './dto/create-module-section.dto';
import { UpdateModuleSectionDto } from './dto/update-module-section.dto';
import { LmsSectionService } from '@/modules/lms/lms-section/lms-section.service';

@Controller('modules/:moduleId/sections')
export class LmsSectionController {
  constructor(
    private readonly lmsSectionService: LmsSectionService,
    private readonly lmsPublishService: LmsPublishService,
  ) {}

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
   * Retrieves a module section by its ID
   */
  @Get(':moduleSectionId')
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findOne(
    @Param('moduleSectionId', new ParseUUIDPipe()) moduleSectionId: string,
  ) {
    return this.lmsSectionService.findById(moduleSectionId);
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

  /**
   * Publishes a section
   *
   * @remarks
   * Publishes a section with an optional date.
   * Requires `ADMIN` role.
   *
   * @param id - The UUID of the section to publish.
   * @returns A Promise that resolves to an object with a message.
   */
  @Post(':id/publish')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  publishSection(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.lmsPublishService.publishSection(id);
  }

  /**
   * Unpublishes a section
   *
   * @remarks
   * Unpublishes a section.
   * Requires `ADMIN` role.
   *
   * @param id - The UUID of the section to unpublish.
   * @returns A Promise that resolves to an object with a message.
   */
  @Post(':id/unpublish')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  unpublishSection(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.lmsPublishService.unpublishSection(id);
  }
}
