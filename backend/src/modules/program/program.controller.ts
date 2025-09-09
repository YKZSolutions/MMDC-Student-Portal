import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProgramService } from './program.service';

import { DeleteQueryDto } from '../../common/dto/delete-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { Program } from '@/generated/nestjs-dto/program.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedProgramsDto } from './dto/paginated-program.dto';
import { CreateProgramDto } from '@/generated/nestjs-dto/create-program.dto';
import { UpdateProgramDto } from '@/generated/nestjs-dto/update-program.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { MajorService } from '../major/major.service';

/**
 * @remarks
 * Handles program-related operations such as creation, update, retrieval, and deletion.
 */
@Controller('programs')
export class ProgramController {
  constructor(
    private readonly programService: ProgramService,
    private readonly majorService: MajorService,
  ) {}

  /**
   * Create a new program
   *
   * @remarks
   * This operation creates a new academic program.
   * Requires `ADMIN` role.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: Program })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  /**
   * Retrieve all programs
   *
   * @remarks
   * Retrieves a paginated list of programs based on the provided filters.
   * Requires `ADMIN` role.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'List of programs retrieved successfully',
    type: PaginatedProgramsDto,
  })
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAll(@Query() filters: BaseFilterDto) {
    return this.programService.findAll(filters);
  }

  /**
   * Retrive all majors of a program
   *
   * @remarks Retrives a paginated list of majors based on the program id and provided filters.
   * Requires `ADMIN` role.
   */
  @Get(':programId/majors')
  @Roles(Role.ADMIN)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findAllMajors(
    @Param('programId', new ParseUUIDPipe()) programId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.majorService.findAll(filters, programId);
  }

  /**
   * Retrieve a specific program by ID
   *
   * @remarks Requires `ADMIN` role.
   *
   */
  @Get(':id')
  @ApiOkResponse({
    description: 'Program retrieved successfully',
    type: Program,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programService.findOne(id);
  }

  /**
   * Update a program
   *
   * @remarks
   * This operation updates the details of an existing program.
   * Requires `ADMIN` role.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Program updated successfully',
    type: Program,
  })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.update(id, updateProgramDto);
  }

  /**
   * Delete a program
   *
   * @remarks
   * This operation permanently deletes a program from the system.
   * Requires `ADMIN` role.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Program deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Program has been permanently deleted.',
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.programService.remove(id, query?.directDelete);
  }
}
