import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { CourseFullDto } from './dto/course-full.dto';
import { CreateCourseFullDto } from './dto/create-course-full.dto';
import { PaginatedCoursesDto } from './dto/paginated-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { LmsService } from '../lms/lms-module/lms.service';
import { MessageDto } from '@/common/dto/message.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly lmsService: LmsService,
  ) {}

  /**
   * Creates a new course in the database.
   *
   * @async
   * @param {CreateCourseFullDto} createCourseDto - Data Transfer Object containing the course details to create.
   * @returns  {Promise<CourseFullDto>} The create course record
   *
   * @throws {ConflictException} - If the course code already exists.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ course }: { course: CreateCourseFullDto }) =>
      `Creating course [${course.courseCode} - ${course.name}]`,
    logSuccessMessage: (course) =>
      `Course [${course.courseCode} - ${course.name}] successfully created.`,
    logErrorMessage: (err, { course }: { course: CreateCourseFullDto }) =>
      `An error has occurred while creating course [${course.courseCode} - ${course.name}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Course code already in use.'),
  })
  async create(
    @LogParam('course') createCourseDto: CreateCourseFullDto,
  ): Promise<CourseFullDto> {
    const { majorIds, prereqIds, coreqIds, ...courseData } = createCourseDto;

    const data: Prisma.CourseCreateInput = {
      ...courseData,
    };

    if (majorIds?.length) {
      data.majors = { connect: majorIds.map((id) => ({ id })) };
    }

    if (prereqIds?.length) {
      data.prereqs = { connect: prereqIds.map((id) => ({ id })) };
    }

    if (coreqIds?.length) {
      data.coreqs = { connect: coreqIds.map((id) => ({ id })) };
    }

    return this.prisma.client.$transaction(async (tx) => {
      const course: CourseFullDto = await tx.course.create({
        data,
        include: { prereqs: true, coreqs: true },
      });

      await this.lmsService.initializeCourseModule(course, tx);

      return course;
    });
  }

  /**
   * Retrieves all courses matching the provided filters, with pagination support.
   *
   * @async
   * @param {BaseFilterDto} filters - Filters and pagination options (e.g., search keyword, page number).
   * @returns {Promise<PaginatedCoursesDto>} - Paginated list of courses with metadata.
   *
   * @throws {BadRequestException} If query parameters are invalid.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching courses with filters ${JSON.stringify(filters)}`,
    logSuccessMessage: (_result, filters) =>
      `Successfully fetched courses with filters ${JSON.stringify(filters)}`,
    logErrorMessage: (err, { filters }) =>
      `Failed to fetch courses with filters ${JSON.stringify(filters)} | Error: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedCoursesDto> {
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
    };
    const page = filters.page || 1;

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            name: { contains: term, mode: Prisma.QueryMode.insensitive },
          },
          {
            description: {
              contains: term,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            courseCode: {
              contains: term,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }));
    }

    const [courses, meta] = await this.prisma.client.course
      .paginate({
        where,
        include: {
          prereqs: { select: { id: true, courseCode: true, name: true } },
          coreqs: { select: { id: true, courseCode: true, name: true } },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    return { courses, meta };
  }

  /**
   * Retrieves a single course by its unique ID.
   *
   * @async
   * @param {string} id - The UUID of the course.
   * @returns {Promise<CourseFullDto>} The course record.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching course record for id ${id}`,
    logSuccessMessage: ({ id }) => `Successfully fetched course for id ${id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while fetching course for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Course not found'),
  })
  async findOne(@LogParam('id') id: string): Promise<CourseFullDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid course ID format');
    }

    return await this.prisma.client.course.findUniqueOrThrow({
      where: { id },
      include: {
        coreqs: {
          select: { id: true, courseCode: true, name: true },
        },
        prereqs: {
          select: { id: true, courseCode: true, name: true },
        },
      },
    });
  }

  /**
   * Updates the details of an existing course.
   *
   * @async
   * @param {string} id - The UUID of the course to update.
   * @param {UpdateCourseDto} updateCourseDto - Data Transfer Object containing updated course details.
   * @returns {Promise<CourseFullDto>} The updated course record.
   *
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {ConflictException} If the course code already exists.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating course for id ${id}`,
    logSuccessMessage: (course) =>
      `Successfully updated course for id ${course.id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while updated course for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Course does not exist`),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('course') updateCourseDto: UpdateCourseDto,
  ): Promise<CourseFullDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid course ID format');
    }

    return await this.prisma.client.$transaction(async (tx) => {
      await tx.course.findUniqueOrThrow({ where: { id } }).then((course) => {
        if (course.courseCode === updateCourseDto.courseCode) {
          throw new ConflictException('Course code already exists');
        }
        if (course.name === updateCourseDto.name) {
          throw new ConflictException('Course name already exists');
        }
      });

      const { majorIds, coreqIds, prereqIds, ...courseData } = updateCourseDto;

      const data: Prisma.CourseUpdateInput = {
        ...courseData,
      };

      if (majorIds) {
        data.majors = { set: majorIds.map((id) => ({ id })) };
      }

      if (coreqIds) {
        data.coreqs = { set: coreqIds.map((id) => ({ id })) };
      }

      if (prereqIds) {
        data.prereqs = { set: prereqIds.map((id) => ({ id })) };
      }

      return tx.course.update({
        where: { id },
        data,
        include: {
          prereqs: true,
          coreqs: true,
        },
      });
    });
  }

  /**
   * Deletes a course from the database.
   *
   * - If `directDelete` is false (or omitted), the course is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the course is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the course to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<MessageDto>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Deleting course with id=${id}, directDelete=${directDelete ?? false}`,
    logSuccessMessage: (_result, { id, directDelete }) =>
      `Successfully deleted course with id=${id} (${directDelete ? 'permanent' : 'soft'})`,
    logErrorMessage: (err, { id }) =>
      `Failed to delete course with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Course with ID ${id} not found`),
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException(
        'Cannot delete course because it is associated with an existing major',
      ),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<MessageDto> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const course = await this.prisma.client.course.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !course.deletedAt) {
      await this.prisma.client.course.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return new MessageDto('Course marked for deletion');
    }

    await this.prisma.client.course.delete({ where: { id } });
    return new MessageDto('Course permanently deleted');
  }
}
