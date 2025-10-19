import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Query,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseFullDto } from './dto/create-course-full.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

/**
 * @remarks
 * Handles course-related operations such as creation, update, retrieval, and deletion.
 *
 */
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Creates a course
   *
   * @remarks This operations creates a new course.
   * Requires `ADMIN` role.
   *
   */
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createCourseDto: CreateCourseFullDto) {
    return this.coursesService.create(createCourseDto);
  }

  /**
   * Retrive all courses
   *
   * @remarks Retrives a paginated list of courses based on the provided filters.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() filters: BaseFilterDto) {
    return this.coursesService.findAll(filters);
  }

  /**
   * Retrieve a specific course by ID
   *
   * @remarks Requires `ADMIN` role.
   *
   */
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  /**
   * Update a course
   *
   * @remarks
   * This operation updates the details of an existing course.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  /**
   * Delete a course
   *
   * @remarks
   * This operation permanently deletes a course from the system.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.coursesService.remove(id, query?.directDelete);
  }
}
