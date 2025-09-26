import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { CreateLessonDto } from '@/generated/nestjs-dto/create-lesson.dto';
import { LessonDto } from '@/generated/nestjs-dto/lesson.dto';
import { UpdateLessonDto } from '@/generated/nestjs-dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new lesson linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating lesson for module content ${moduleContentId}`,
    logSuccessMessage: (lesson) =>
      `Lesson [${lesson.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating lesson for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Lesson already exists for this module content'),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('lessonData') lessonData: CreateLessonDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<LessonDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const lesson = await client.lesson.create({
      data: {
        ...lessonData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...lesson,
      content: lesson.content as Prisma.JsonArray,
    };
  }

  /**
   * Updates an existing lesson
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating lesson for module content ${moduleContentId}`,
    logSuccessMessage: (lesson) =>
      `Lesson [${lesson.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating lesson for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Lesson not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('lessonData') lessonData: UpdateLessonDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<LessonDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const lesson = await client.lesson.update({
      where: { moduleContentId },
      data: {
        ...lessonData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...lesson,
      content: lesson.content as Prisma.JsonArray,
    };
  }

  /**
   * Finds a lesson by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding lesson for module content ${moduleContentId}`,
    logSuccessMessage: (lesson) =>
      `Lesson [${lesson.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding lesson for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Lesson not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<LessonDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const lesson = await this.prisma.client.lesson.findUniqueOrThrow({
      where: { moduleContentId },
    });

    return {
      ...lesson,
      content: lesson.content as Prisma.JsonArray,
    };
  }

  /**
   * Removes a lesson by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing lesson for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `Lesson for module content ${moduleContentId} hard deleted.`
        : `Lesson for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing lesson for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('directDelete') directDelete = false,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    if (directDelete) {
      await client.lesson.delete({ where: { moduleContentId } });
    } else {
      await client.lesson.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'Lesson successfully removed' };
  }

  // /**
  //  * Finds lessons with progress for a specific student
  //  */
  // async findStudentLessons(
  //   studentId: string,
  //   filters: {
  //     courseOfferingId?: string;
  //     moduleId?: string;
  //     status?: 'completed' | 'in-progress' | 'not-started';
  //   } = {},
  // ) {
  //   if (!isUUID(studentId)) {
  //     throw new BadRequestException('Invalid student ID format');
  //   }
  //
  //   const where: Prisma.LessonWhereInput = {
  //     moduleContent: {
  //       module: {
  //         courseOfferingId: filters.courseOfferingId,
  //         id: filters.moduleId,
  //       },
  //     },
  //   };
  //
  //   return await this.prisma.client.lesson.findMany({
  //     where,
  //     include: {
  //       moduleContent: {
  //         include: {
  //           module: {
  //             include: {
  //               courseOffering: true,
  //             },
  //           },
  //           studentProgress: {
  //             where: { userId: studentId },
  //           },
  //         },
  //       },
  //     },
  //     orderBy: {
  //       moduleContent: {
  //         order: 'asc',
  //       },
  //     },
  //   });
  // }
}
