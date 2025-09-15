// assignment.service.ts
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
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { CreateAssignmentDto } from '@/generated/nestjs-dto/create-assignment.dto';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new assignment linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating assignment for module content ${moduleContentId}`,
    logSuccessMessage: (assignment) =>
      `Assignment [${assignment.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating assignment for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Assignment already exists for this module content',
      ),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('assignmentData')
    assignmentData: CreateAssignmentDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<AssignmentDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const assignment = await client.assignment.create({
      data: {
        ...assignmentData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...assignment,
      content: assignment.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing assignment
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating assignment for module content ${moduleContentId}`,
    logSuccessMessage: (assignment) =>
      `Assignment [${assignment.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating assignment for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Assignment not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('assignmentData')
    assignmentData: UpdateAssignmentDto,
    @LogParam('transactionClient')
    tx: PrismaTransaction,
  ): Promise<AssignmentDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const assignment = await client.assignment.update({
      where: { moduleContentId },
      data: {
        ...assignmentData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...assignment,
      content: assignment.content as Prisma.JsonValue,
    };
  }

  /**
   * Finds an assignment by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding assignment for module content ${moduleContentId}`,
    logSuccessMessage: (assignment) =>
      `Assignment [${assignment.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding assignment for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Assignment not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<Assignment> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const assignment = await this.prisma.client.assignment.findUniqueOrThrow({
      where: { moduleContentId },
      include: {
        submissions: true,
        grading: true,
      },
    });

    return {
      ...assignment,
      content: assignment.content as Prisma.JsonValue,
      grading: assignment.grading
        ? {
            ...assignment.grading,
            gradingSchema: assignment.grading.gradingSchema as Prisma.JsonValue,
            curveSettings: assignment.grading.curveSettings as Prisma.JsonValue,
          }
        : null,
      submissions: assignment.submissions.map((submission) => ({
        ...submission,
        content: submission.content as Prisma.JsonValue,
      })),
    };
  }

  /**
   * Removes an assignment by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing assignment for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `Assignment for module content ${moduleContentId} hard deleted.`
        : `Assignment for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing assignment for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('directDelete') directDelete: boolean = false,
    tx?: PrismaTransaction,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    if (directDelete) {
      await client.assignment.delete({ where: { moduleContentId } });
    } else {
      await client.assignment.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'Assignment successfully removed' };
  }
}
