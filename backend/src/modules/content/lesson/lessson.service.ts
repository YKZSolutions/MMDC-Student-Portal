// lesson.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Lesson, Prisma } from '@prisma/client';
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
    @LogParam('lessonData')
    lessonData: CreateLessonDto,
  ): Promise<LessonDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const lesson = await this.prisma.client.lesson.create({
      data: {
        ...lessonData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...lesson,
      content: lesson.content as Prisma.JsonValue,
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
    @LogParam('lessonData')
    lessonData: UpdateLessonDto,
  ): Promise<LessonDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const lesson = await this.prisma.client.lesson.update({
      where: { moduleContentId },
      data: {
        ...lessonData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...lesson,
      content: lesson.content as Prisma.JsonValue,
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
  ): Promise<Lesson> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    return await this.prisma.client.lesson.findUniqueOrThrow({
      where: { moduleContentId },
    });
  }

  /**
   * Deletes a lesson
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Deleting lesson for module content ${moduleContentId}`,
    logSuccessMessage: () => 'Lesson successfully deleted.',
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while deleting lesson for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Lesson not found'),
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    await this.prisma.client.lesson.delete({
      where: { moduleContentId },
    });

    return { message: 'Lesson successfully deleted' };
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
