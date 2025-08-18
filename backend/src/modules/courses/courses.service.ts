import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { PaginatedCoursesDto } from './dto/paginated-course.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new course in the database.
   *
   * @async
   * @param {CreateCourseDto} createCourseDto - Data Transfer Object containing the course details to create.
   * @returns  {Promise<CourseDto>} The create course record
   *
   * @throws {ConflictException} - If the course code already exists.
   * @throws {Error} Any other unexpected errors.
   */

  @Log({})
  async create(
    @LogParam('course') createCourseDto: CreateCourseDto,
  ): Promise<CourseDto> {
    try {
      const { majorIds, prereqIds, coreqIds, ...courseData } = createCourseDto;

      return await this.prisma.client.course.create({
        data: {
          ...courseData,
          major: majorIds?.length
            ? { connect: majorIds.map((id) => ({ id })) }
            : undefined,
          prereqs: prereqIds?.length
            ? { connect: prereqIds.map((id) => ({ id })) }
            : undefined,
          coreqs: coreqIds?.length
            ? { connect: coreqIds.map((id) => ({ id })) }
            : undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create course with code ${createCourseDto.courseCode}`,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new ConflictException(
            `Course code ${createCourseDto.courseCode} already exits`,
          );

      throw error;
    }
  }

  /**
   * Retrieves all courses matching the provided filters, with pagination support.
   *
   * @async
   * @param {BaseFilterDto} filters - Filters and pagination otions (e.g., search keyword, page number).
   * @returns {Promise<PaginatedCoursesDto>} - Paginated list of courses with metadata.
   *
   * @throws {BadRequestException} If query parameters are invalid.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({})
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedCoursesDto> {
    try {
      const where: Prisma.CourseWhereInput = {};
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
        .paginate({ where })
        .withPages({ limit: 10, page, includePageCount: true });

      return { courses, meta };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve courses with filters: ${JSON.stringify(filters)}`,
      );
      throw error;
    }
  }

  /**
   * Retrieves a single course by it's unique ID.
   *
   * @async
   * @param {string} id - The UUID of the course.
   * @returns {Promise<CourseDto>} The course record.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({})
  async findOne(@LogParam('id') id: string): Promise<CourseDto> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid course ID format');
      }

      return await this.prisma.client.course.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve course with ID ${id}`);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException(`Course with ID ${id} not found.`);

      throw error;
    }
  }

  /**
   * Updates the details of an existing course.
   *
   * @async
   * @param {string} id - The UUID of the course to update.
   * @param {UpdateCourseDto} updateCourseDto - Data Transfer Object containing updated course details.
   * @returns {Promise<CourseDto>} The updated course record.
   *
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {ConflictException} If the course code already exists.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({})
  async update(
    @LogParam('id') id: string,
    @LogParam('course') updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDto> {
    try {
      if (!isUUID(id)) {
        throw new NotFoundException(`Course with ID ${id} not found.`);
      }

      const { majorIds, coreqIds, ...courseData } = updateCourseDto;

      return await this.prisma.client.course.update({
        where: { id },
        data: {
          ...courseData,
          ...(majorIds !== undefined && {
            major: { set: majorIds.map((id) => ({ id })) },
          }),
          ...(coreqIds !== undefined && {
            coreqs: { set: coreqIds.map((id) => ({ id })) },
          }),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update course with ID ${id} and payload ${JSON.stringify(
          updateCourseDto,
        )}`,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Course with ID ${id} not found.`);
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            `Course code ${updateCourseDto.courseCode} already exits`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Deletes a course from the database.
   *
   * - If `directDelete` is false (or omitted), the coyrse is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the course is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the course to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<{ message: string }>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no course is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({})
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
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

        return { message: 'Course marked for deletion' };
      }

      await this.prisma.client.course.delete({ where: { id } });
      return { message: 'Course permanently deleted' };
    } catch (error) {
      this.logger.error(
        `Failed to delete course with ID ${id}, directDelete=${directDelete}`,
      );

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException(`Course with ID ${id} not found.`);

      throw error;
    }
  }
}
