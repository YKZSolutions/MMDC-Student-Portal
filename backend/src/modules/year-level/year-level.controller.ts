import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { YearLevelService } from './year-level.service';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { YearLevel } from '@/generated/nestjs-dto/yearLevel.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedYearLevelsDto } from './dto/paginated-year-level.dto';
import { CreateYearLevelDto } from '@/generated/nestjs-dto/create-yearLevel.dto';
import { UpdateYearLevelDto } from '@/generated/nestjs-dto/update-yearLevel.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';

@Controller('year-levels')
export class YearLevelController {
  constructor(private readonly yearLevelService: YearLevelService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: YearLevel })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  create(@Body() createYearLevelDto: CreateYearLevelDto) {
    return this.yearLevelService.create(createYearLevelDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'List of year levels retrieved successfully',
    type: PaginatedYearLevelsDto,
  })
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAll(@Query() filters: BaseFilterDto) {
    return this.yearLevelService.findAll(filters);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Year level retrieved successfully',
    type: YearLevel,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.yearLevelService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Year level updated successfully',
    type: YearLevel,
  })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateYearLevelDto: UpdateYearLevelDto,
  ) {
    return this.yearLevelService.update(id, updateYearLevelDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Year level deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Year level has been permanently deleted.',
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.yearLevelService.remove(id, query?.directDelete);
  }
}
