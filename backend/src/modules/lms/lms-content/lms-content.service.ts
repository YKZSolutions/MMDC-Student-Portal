import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { omitAuditDates, omitPublishFields } from '@/config/prisma_omit.config';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { FilterModuleContentsDto } from '@/modules/lms/lms-content/dto/filter-module-contents.dto';
import { PaginatedModuleContentDto } from '@/modules/lms/lms-content/dto/paginated-module-content.dto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType, Prisma, ProgressStatus, Role } from '@prisma/client';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { DetailedContentProgressDto } from './dto/detailed-content-progress.dto';
import { AssignmentService } from '../assignment/assignment.service';
import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { FullModuleContent } from '@/modules/lms/lms-content/types';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { mapModuleContentToFullModuleContent } from '@/modules/lms/lms-content/helper/mapper';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private assignmentService: AssignmentService,
  ) {}

  @Log({
    logArgsMessage: ({
      moduleId,
      content,
    }: {
      moduleId: string;
      content: CreateModuleContentDto;
    }) =>
      `Creating module content in module ${moduleId} and section ${content.moduleSection.connect.id}`,
    logSuccessMessage: (content) =>
      `Module content [${content.id}] with type ${content.contentType} successfully created.`,
    logErrorMessage: (
      err,
      {
        moduleId,
      }: {
        moduleId: string;
      },
    ) =>
      `An error has occurred while creating module content [${moduleId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Module content title already exists in this section.',
      ),
  })
  async create(
    @LogParam('moduleId') moduleId: string,
    @LogParam('content') createModuleContentDto: CreateModuleContentDto,
  ): Promise<FullModuleContent> {
    const result = await this.prisma.client.$transaction(async (tx) => {
      // 1. Determine the order within the section
      const { _max } = await tx.moduleContent.aggregate({
        where: {
          moduleSectionId: createModuleContentDto.moduleSection.connect.id,
        },
        _max: { order: true },
      });

      const appendOrder = (_max.order ?? 0) + 1;

      // 2. Create the base module content
      const newContent = await tx.moduleContent.create({
        data: {
          ...createModuleContentDto,
          order: appendOrder,
          ...(createModuleContentDto.contentType === ContentType.ASSIGNMENT && {
            assignment: {
              create: {
                mode: 'INDIVIDUAL',
                maxScore: 0,
                weightPercentage: 0,
              },
            }, // Create an empty assignment object
          }),
        },
      });

      // 3. Fetch the studentIds enrolled in the module and initialize their progress
      const studentIds = await tx.user.findMany({
        where: {
          courseEnrollment: {
            some: { courseOffering: { modules: { some: { id: moduleId } } } },
          },
        },
        select: { id: true },
      });

      if (studentIds.length > 0) {
        await tx.contentProgress.createMany({
          data: studentIds.map(({ id }) => ({
            studentId: id,
            moduleId,
            moduleContentId: newContent.id,
            status: ProgressStatus.NOT_STARTED,
          })),
        });
      }

      return newContent;
    });

    // 4. Always return fresh with relations
    return this.findOne(result.id, Role.admin, null);
  }

  @Log({
    logArgsMessage: ({ id }) => `Fetching module content record for id ${id}`,
    logSuccessMessage: ({ id }) =>
      `Successfully fetched module content for id ${id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while fetching module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Module content not found'),
  })
  async findOne(
    @LogParam('id') id: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId: string | null,
  ): Promise<FullModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // Explicitly type baseInclude to allow dynamic properties
    const baseInclude = {} as Prisma.ModuleContentInclude;

    if (role === Role.student && userId) {
      baseInclude.studentProgress = {
        where: { studentId: userId },
      };
    }

    // Apply security filters based on the role
    const queryOptions: Prisma.ModuleContentFindUniqueOrThrowArgs = {
      where: { id },
      include: baseInclude,
    };

    if (role === Role.student) {
      queryOptions.omit = { ...omitAuditDates, ...omitPublishFields };
    }

    return mapModuleContentToFullModuleContent(
      (await this.prisma.client.moduleContent.findUniqueOrThrow(
        queryOptions,
      )) as ModuleContent,
    );
  }

  @Log({
    logArgsMessage: ({ id }: { id: string }) =>
      `Updating module content for id ${id}`,
    logSuccessMessage: (moduleContent) =>
      `Successfully updated module content for id ${moduleContent.id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while updating module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module content not found for Id ${id}`),
    [PrismaErrorCode.UniqueConstraint]: (_, { id }: { id: string }) =>
      new ConflictException(
        `Module content ${id} already exists in this section`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') dto: UpdateModuleContentDto,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    return this.prisma.client.moduleContent
      .update({
        where: { id },
        data: dto,
      })
      .then((item) => {
        return {
          ...item,
          content: item.content as Prisma.JsonValue[],
        };
      });
  }

  /**
   * Remove module content and its associated sub-content
   */
  @Log({
    logArgsMessage: ({ id }) => `Removing module content for id ${id}`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while removing module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Module content not found'),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Get current content inside transaction
      const currentContent = await tx.moduleContent.findUnique({
        where: { id },
        select: { contentType: true },
      });

      if (!currentContent) {
        throw new NotFoundException(`Module content with ID ${id} not found`);
      }

      let message = 'Module content successfully removed.';

      // 2. Delegate child deletion/soft-delete (pass tx)
      switch (currentContent.contentType) {
        case ContentType.ASSIGNMENT:
          message = (await this.assignmentService.remove(directDelete, id, tx))
            .message;
          break;
      }

      // 3. Delete or soft-delete the moduleContent itself
      if (directDelete) {
        await tx.moduleContent.delete({ where: { id } });
      } else {
        await tx.moduleContent.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        message = 'Module content successfully soft-deleted.';
      }

      return { message: message };
    });
  }

  @Log({
    logArgsMessage: ({ userId, filters }) =>
      `Fetching all module contents for user ${userId} with filters ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Successfully fetched ${result.moduleContents.length} content items`,
    logErrorMessage: (err, { userId }) =>
      `Error fetching multiple module contents for user ${userId}: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: FilterModuleContentsDto,
  ): Promise<PaginatedModuleContentDto> {
    const whereCondition: Prisma.ModuleContentWhereInput = {
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { subtitle: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      contentType: filters.contentType,
      studentProgress: {
        some: {
          status: filters.progress,
        },
      },
    };

    // ----- Final Query -----
    const [items, meta] = await this.prisma.client.moduleContent
      .paginate({
        where: whereCondition,
        include: {
          studentProgress: true,
          assignment: true,
        },
        orderBy: [{ assignment: { dueDate: 'asc' } }],
      })
      .withPages({
        limit: filters.limit || 10,
        page: filters.page,
        includePageCount: true,
      });

    const moduleContents = items.map((item) => {
      return mapModuleContentToFullModuleContent(item as ModuleContent);
    });

    return { moduleContents, meta };
  }

  /**
   * Creates or updates a content progress record for a given user and module content.
   *
   * @async
   * @param {string} moduleId - The UUID of the module that contains the content.
   * @param {string} moduleContentId - The UUID of the module content for which progress is being tracked.
   * @param {string} userId - The UUID of the user making the request.
   * @returns {Promise<DetailedContentProgressDto>} - The upserted content progress record, including related content details.
   * @throws {BadRequestException} - If the user ID is missing or invalid.
   * @throws {NotFoundException} - If the related User, Module, or ModuleContent record does not exist.
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Inserting content progress for content ${moduleContentId}`,
    logSuccessMessage: (result) =>
      `Inserted content progress ${result.id} content ${result.moduleContent.id}`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Inserting content progress for content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: () =>
      new NotFoundException(
        `Required records (moduleId, moduleContentId, userId) not found`,
      ),
  })
  async createContentProgress(
    @LogParam('moduleId') moduleId: string,
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('userId') userId: string,
  ): Promise<DetailedContentProgressDto> {
    if (!userId) {
      throw new BadRequestException(`Invalid userId ${userId}`);
    }

    return await this.prisma.client.contentProgress.upsert({
      where: {
        studentId_moduleContentId: {
          studentId: userId,
          moduleContentId,
        },
      },
      create: {
        studentId: userId,
        moduleId,
        moduleContentId,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
      include: {
        moduleContent: {
          select: {
            id: true,
            contentType: true,
            order: true,
            moduleSectionId: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves all content progress records for a specific module and user.
   *
   * @async
   * @param {string} moduleId - The UUID of the module for which content progress is being fetched.
   * @param {string} userId - The UUID of the user making this request.
   * @param {Role} role - The role of the user making this request.
   * @returns {Promise<DetailedContentProgressDto[]>} - An array of content progress records with related module content details.
   * @throws {BadRequestException} - If the student ID is missing or invalid.
   */
  @Log({
    logArgsMessage: ({ moduleId, userId, role }) =>
      `Fetching content progress for module ${moduleId} student ${role === 'student' ? 'self' : userId}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.length} content progress records`,
    logErrorMessage: (err, { moduleId, studentId }) =>
      `Fetching content progress for module ${moduleId} student ${studentId ?? 'self'} | Error: ${err.message}`,
  })
  async findAllContentProgress(
    @LogParam('moduleId') moduleId: string,
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
  ): Promise<DetailedContentProgressDto[]> {
    return await this.prisma.client.contentProgress.findMany({
      where: {
        moduleId,
        ...(role === Role.student && { studentId: userId }),
      },
      include: {
        moduleContent: {
          select: {
            id: true,
            contentType: true,
            order: true,
            moduleSectionId: true,
          },
        },
      },
      orderBy: { moduleContent: { order: 'asc' } },
    });
  }
}
