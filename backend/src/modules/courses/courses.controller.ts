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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CourseDto } from './dto/course.dto';

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
  @ApiCreatedResponse({ type: CourseDto })
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
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
  @ApiOkResponse({ type: CourseDto })
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
  @ApiOkResponse({ type: CourseDto })
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
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          examples: [
            'Course marked for deletion',
            'Course permanently deleted',
          ],
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query?: DeleteQueryDto,
  ) {
    return this.coursesService.remove(id, query?.directDelete);
  }
}
