import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Log } from '@/common/decorators/log.decorator';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { ContentType, Prisma, Role } from '@prisma/client';
import { isUUID } from 'class-validator';
import { omitAuditDates, omitPublishFields } from '@/config/prisma_omit.config';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { AssignmentService } from '@/modules/content/assignment/assignment.service';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    @Inject('AssignmentService')
    private assignmentService: AssignmentService,
    @Inject('LessonService')
    private lessonService: LessonService,
    // Inject other content type services as needed
  ) {}

  @Log({
    logArgsMessage: ({ content }: { content: CreateContentDto }) =>
      `Creating module content [${content.title}] in section ${content.sectionId}`,
    logSuccessMessage: (content) =>
      `Module content [${content.title}] successfully created.`,
    logErrorMessage: (
      err,
      {
        content,
      }: {
        content: CreateContentDto;
      },
    ) =>
      `An error has occurred while creating module content [${content.title}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Module content title already exists in this section.',
      ),
  })
  async create(
    @LogParam('content') createModuleContentDto: CreateContentDto,
    @LogParam('moduleId') moduleId: string,
  ): Promise<ModuleContent> {
    const { sectionId, ...rest } = createModuleContentDto;

    // Create the base module content
    const data: Prisma.ModuleContentCreateInput = {
      ...rest,
      module: { connect: { id: moduleId } },
      moduleSection: sectionId ? { connect: { id: sectionId } } : undefined,
    };

    const content = await this.prisma.client.moduleContent.create({
      data,
    });

    // Delegate to specialized services for content-type specific creation
    if (createModuleContentDto.contentType === ContentType.ASSIGNMENT) {
      await this.assignmentService.create(
        content.id,
        createModuleContentDto.assignmentData,
      );
    } else if (createModuleContentDto.contentType === ContentType.LESSON) {
      await this.lessonService.create(
        content.id,
        createModuleContentDto.lessonData,
      );
    }
    // Add other content types as needed

    return this.findOne(content.id, Role.admin, null, content.contentType);
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
    @LogParam('contentType') contentType: ContentType,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // Base query
    const baseQuery = {
      where: { id },
      include: {
        studentProgress: userId
          ? {
              where: { userId },
            }
          : undefined,
      },
    };

    // Add content-type specific includes
    if (contentType === ContentType.ASSIGNMENT) {
      baseQuery.include.assignment = true;
      if (role === Role.student && userId) {
        baseQuery.include.assignment.include = {
          submissions: {
            where: { studentId: userId },
          },
        };
      }
    } else if (contentType === ContentType.LESSON) {
      baseQuery.include.lesson = true;
    }
    // Add other content types as needed

    // Apply security filters based on role
    if (role === Role.student) {
      baseQuery.omit = { ...omitAuditDates, ...omitPublishFields };
    }

    return await this.prisma.client.moduleContent.findUniqueOrThrow(baseQuery);
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
    [PrismaErrorCode.UniqueConstraint]: (
      _,
      { content }: { content: UpdateContentDto },
    ) =>
      new ConflictException(
        `Module content title ${content?.title} already exists in this section`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('content') updateContentDto: UpdateContentDto,
    @LogParam('publishedBy') publishedBy?: string | null,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // First get the current content to know its type
    const currentContent = await this.prisma.client.moduleContent.findUnique({
      where: { id },
      select: { contentType: true },
    });

    if (!currentContent) {
      throw new NotFoundException(`Module content with ID ${id} not found`);
    }

    const { sectionId, ...contentData } = updateContentDto;

    const data: Prisma.ModuleContentUpdateInput = {
      ...contentData,
    };

    if (sectionId) {
      data.moduleSection = { connect: { id: sectionId } };
    }

    if (contentData.publishedAt || contentData.toPublishAt) {
      if (publishedBy) {
        data.publishedByUser = { connect: { id: publishedBy } };
      }
    } else {
      data.publishedByUser = { disconnect: true };
    }

    // Update the base module content
    const updatedContent = await this.prisma.client.moduleContent.update({
      where: { id },
      data,
    });

    // Delegate to specialized services for content-type specific updates
    if (
      currentContent.contentType === ContentType.ASSIGNMENT &&
      updateContentDto.assignmentData
    ) {
      await this.assignmentService.update(id, updateContentDto.assignmentData);
    } else if (
      currentContent.contentType === ContentType.LESSON &&
      updateContentDto.lessonData
    ) {
      await this.lessonService.update(id, updateContentDto.lessonData);
    }
    // Add other content types as needed

    return this.findOne(id, Role.admin, null, currentContent.contentType);
  }

  // remove method remains the same as before
  // ...

  // Consider moving findAllAssignments to a separate AssignmentService
}
