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
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto } from '@/generated/nestjs-dto/create-major.dto';
import { UpdateMajorDto } from '@/generated/nestjs-dto/update-major.dto';
import { FilterMajorDto } from './dto/filter-major.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Major } from '@/generated/nestjs-dto/major.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { PaginatedMajorDto } from './dto/paginated-major.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';

/**
 * @remarks
 * Handles academic major-related operations such as creation, update, retrieval, and deletion.
 */
@Controller('major')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  /**
   * Creates a major.
   *
   * @remarks This operation creates a new academic major.
   * Requries `ADMIN` role.
   *
   * @returns
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: Major })
  @ApiException(() => ConflictException)
  @ApiException(() => [ConflictException, InternalServerErrorException])
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorService.create(createMajorDto);
  }

  /**
   * Retrive all majors
   *
   * @remarks Retrives a paginated list of majors based on the provided filters.
   * Requires `ADMIN` role.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: PaginatedMajorDto })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findAll(@Query() filters: FilterMajorDto) {
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
  @ApiOkResponse({ type: Major })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findOne(@Param('id') id: string) {
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
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
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
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query?: DeleteQueryDto,
  ) {
    return this.majorService.remove(id, query?.directDelete);
  }
}
