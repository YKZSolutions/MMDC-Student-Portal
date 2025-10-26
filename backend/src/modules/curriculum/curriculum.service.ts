import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumWithCoursesDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumWithCourseDto } from './dto/update-curriculum.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CurriculumDto } from '@/generated/nestjs-dto/curriculum.dto';
import { CurriculumWithCoursesDto } from './dto/curriculum-with-course.dto';
import { CurriculumItemDto } from './dto/curriculum-item.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { validate } from 'uuid';
import { MessageDto } from '@/common/dto/message.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new curriculum along with its associated courses.
   *
   * @param createCurriculumDto - The DTO containing curriculum and courses data.
   * @returns The created curriculum object in DTO format.
   */
  @Log({
    logArgsMessage: ({
      createCurriculumDto,
    }: {
      createCurriculumDto: CreateCurriculumWithCoursesDto;
    }) =>
      `Creating curriculum for major=${createCurriculumDto.majorId} and ${createCurriculumDto.courses.length} courses`,
    logSuccessMessage: (res) => `Created curriculum with id=${res.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: () =>
      new NotFoundException(
        `Missing relevant records to create the curriculum.`,
      ),
  })
  async create(
    @LogParam('createCurriculumDto')
    createCurriculumDto: CreateCurriculumWithCoursesDto,
  ): Promise<CurriculumDto> {
    return this.prisma.client.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.create({
        data: {
          majorId: createCurriculumDto.majorId,
          ...createCurriculumDto.curriculum,
        },
      });

      const courses = await tx.course.findMany({
        where: {
          id: {
            in: createCurriculumDto.courses.map((course) => course.courseId),
          },
          deletedAt: null,
        },
      });

      const payloadMap = new Map(
        createCurriculumDto.courses.map((c) => [c.courseId, c]),
      );

      const createCurriculumCourses: Prisma.CurriculumCourseCreateManyInput[] =
        courses.map((course) => {
          const payload = payloadMap.get(course.id)!;
          return {
            curriculumId: curriculum.id,
            courseId: course.id,
            year: payload.year,
            semester: payload.semester,
            order: payload.order,
          };
        });

      await tx.curriculumCourse.createMany({
        data: createCurriculumCourses,
      });

      return curriculum;
    });
  }

  /**
   * Retrieves all curriculums with their associated majors and programs.
   *
   * @returns A list of curriculum items.
   */
  @Log({
    logArgsMessage: () => `Fetching all curriculums`,
    logSuccessMessage: (res) => `Fetched ${res.length} curriculums`,
  })
  async findAll(): Promise<CurriculumItemDto[]> {
    return (
      await this.prisma.client.curriculum.findMany({
        where: {
          deletedAt: null,
          major: { deletedAt: null, program: { deletedAt: null } },
        },
        include: {
          major: {
            include: {
              program: true,
            },
          },
        },
      })
    ).map((items) => {
      const { major: majorItem, ...curriculum } = items;
      const { program, ...major } = majorItem;

      return {
        ...curriculum,
        program: program,
        major: major,
      };
    });
  }

  /**
   * Retrieves a single curriculum by ID along with its courses.
   *
   * @param id - The ID of the curriculum to retrieve.
   * @returns The curriculum object with associated courses.
   * @throws NotFoundException - If curriculum with id is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching curriculum with id=${id}`,
    logSuccessMessage: (res) =>
      `Fetched curriculum with id=${res.curriculum.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Curriculum with id=${id} was not found`),
  })
  async findOne(@LogParam('id') id: string): Promise<CurriculumWithCoursesDto> {
    const where: Prisma.CurriculumWhereInput = {
      deletedAt: null,
    };

    if (validate(id)) {
      where.id = id;
    } else if (/^[A-Za-z]+-[A-Za-z]+$/.test(id)) {
      const [programCode, majorCode] = id.split('-');

      where.major = {
        majorCode,
        program: {
          programCode,
        },
      };
    } else {
      throw new BadRequestException('Invalid id: not a uuid or code format');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.findFirstOrThrow({
        where,
        include: {
          major: {
            include: {
              program: true,
            },
          },
        },
      });

      const courses = await tx.curriculumCourse.findMany({
        where: {
          curriculumId: curriculum.id,
          deletedAt: null,
        },
        include: {
          course: true,
        },
      });

      const { major: majorItem, ...item } = curriculum;
      const { program, ...major } = majorItem;

      return {
        curriculum: {
          ...item,
          major: major,
          program: program,
        },
        courses,
      };
    });
  }

  /**
   * Updates a curriculum entry and its associated courses.
   *
   * @param id - The ID of the curriculum to update.
   * @param updateCurriculumDto - The DTO with updated curriculum and courses data.
   * @returns The updated curriculum object.
   * @throws NotFoundException - If curriculum with id is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating curriculum with id=${id}`,
    logSuccessMessage: (res) => `Updated curriculum with id=${res.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Curriculum with id=${id} was not found`),
    [PrismaErrorCode.RelatedRecordNotFound]: () =>
      new BadRequestException(
        `Missing relevant records to update the curriculum.`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    updateCurriculumDto: UpdateCurriculumWithCourseDto,
  ): Promise<CurriculumDto> {
    return this.prisma.client.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.update({
        where: { id, deletedAt: null },
        data: {
          majorId: updateCurriculumDto.majorId,
          ...updateCurriculumDto.curriculum,
        },
      });

      // Manually upsert curriculum courses: for each course, find an existing record and update it, or create a new one if it does not exist
      for (const course of updateCurriculumDto.courses) {
        // Find existing non-deleted record
        const existing = await tx.curriculumCourse.findFirst({
          where: {
            curriculumId: id,
            courseId: course.courseId,
            deletedAt: null,
          },
        });

        if (existing) {
          // Update existing
          await tx.curriculumCourse.update({
            where: { id: existing.id },
            data: {
              year: course.year,
              semester: course.semester,
              order: course.order,
            },
          });
        } else {
          // Create new
          await tx.curriculumCourse.create({
            data: {
              curriculumId: id,
              courseId: course.courseId,
              year: course.year,
              semester: course.semester,
              order: course.order,
            },
          });
        }
      }

      await tx.curriculumCourse.updateMany({
        where: {
          curriculumId: id,
          courseId: {
            notIn: updateCurriculumDto.courses.map((c) => c.courseId),
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return curriculum;
    });
  }

  /**
   * Deletes a curriculum (soft delete or permanent).
   *
   * - If `directDelete` is true, the curriculum is permanently deleted.
   * - If `directDelete` is false or undefined:
   *   - If `deletedAt` is null, sets soft delete.
   *   - If already deleted, it is permanently removed.
   *
   * @param id - The ID of the curriculum to delete.
   * @param directDelete - Whether to skip soft delete and directly remove it.
   * @returns A message indicating the result.
   * @throws NotFoundException - If curriculum with id is not found.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing curriculum with id=${id}, directDelete=${directDelete}`,
    logSuccessMessage: (res) => res.message,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Curriculum with id=${id} was not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<MessageDto> {
    if (!directDelete) {
      const curriculum = await this.prisma.client.curriculum.findFirstOrThrow({
        where: { id },
      });
      if (!curriculum.deletedAt) {
        await this.prisma.client.$transaction(async (tx) => {
          await tx.curriculumCourse.updateMany({
            where: { curriculumId: id },
            data: {
              deletedAt: new Date(),
            },
          });

          await tx.curriculum.update({
            where: { id },
            data: {
              deletedAt: new Date(),
            },
          });
        });

        return new MessageDto('Curriculum marked for deletion');
      }
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.curriculumCourse.deleteMany({
        where: { curriculumId: id },
      });

      await tx.curriculum.delete({
        where: { id },
      });
    });

    return new MessageDto('Curriculum permanently deleted');
  }
}
