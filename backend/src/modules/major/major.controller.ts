import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { UpdateMajorDto } from '@/generated/nestjs-dto/update-major.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { Major } from '@/generated/nestjs-dto/major.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { PaginatedMajorsDto } from './dto/paginated-major.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CreateProgramMajorDto } from './dto/create-major.dto';
import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { MajorItemDto } from '@/modules/major/dto/major-item.dto';
import { MessageDto } from '@/common/dto/message.dto';

/**
 * @remarks
 * Handles academic major-related operations such as creation, update, retrieval, and deletion.
 */
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  /**
   * Creates a major.
   *
   * @remarks This operation creates a new academic major.
   * Requires `ADMIN` role.
   *
   * @returns
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [ConflictException, InternalServerErrorException])
  create(
    @Body() createProgramMajorDto: CreateProgramMajorDto,
  ): Promise<MajorDto> {
    return this.majorService.create(createProgramMajorDto);
  }

  /**
   * Retrieve all majors
   *
   * @remarks Retrieves a paginated list of majors based on the provided filters.
   * Requires `ADMIN` role.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findAll(@Query() filters: BaseFilterDto): Promise<PaginatedMajorsDto> {
    return this.majorService.findAll(filters);
  }

  /**
   * Retrieve a specific major by ID
   *
   * @remarks Requires `ADMIN` role.
   *
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<MajorItemDto> {
    return this.majorService.findOne(id);
  }

  /**
   * Update a major
   *
   * @remarks
   * This operation updates the details of an existing major.
   * Requires `ADMIN` role.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: Major })
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMajorDto: UpdateMajorDto,
  ): Promise<MajorDto> {
    return this.majorService.update(id, updateMajorDto);
  }

  /**
   * Delete a major
   *
   * @remarks
   * This operation permanently deletes a major from the system.
   * Requires `ADMIN` role.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Major has been permanently deleted.',
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: DeleteQueryDto,
  ): Promise<MessageDto> {
    return this.majorService.remove(id, query?.directDelete);
  }
}
