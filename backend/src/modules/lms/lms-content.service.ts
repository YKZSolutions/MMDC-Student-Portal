import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Log } from '@/common/decorators/log.decorator';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { PrismaError, PrismaErrorCode, } from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Prisma, Role } from '@prisma/client';
import { isUUID } from 'class-validator';
import { omitAuditDates, omitPublishFields } from '@/config/prisma_omit.config';
import { StudentContentDto } from '@/modules/lms/dto/student-content.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new module content in the database.
   *
   * @async
   * @param {CreateModuleContentDto} createModuleContentDto - Data Transfer Object containing the module content details to create.
   * @param {string} moduleId - The UUID of the module to which the content belongs.
   * @returns {Promise<ModuleContent>} The created module content record
   *
   * @throws {ConflictException} - If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
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
    const { sectionId, assignment, ...rest } = createModuleContentDto;

    const data: Prisma.ModuleContentCreateInput = {
      ...rest,
      module: { connect: { id: moduleId } },
      moduleSection: sectionId ? { connect: { id: sectionId } } : undefined,
      assignment: assignment ? { create: assignment } : undefined,
    };

    //TODO: add content creation based on type
    return (await this.prisma.client.moduleContent.create({
      data,
      include: {
        assignment: true,
      },
    })) as ModuleContent;
  }

  /**
   * Retrieves a single module content by its unique ID.
   *
   * @async
   * @param {string} id - The UUID of the module content.
   * @returns {Promise<ModuleContentDto>} The module content record.
   * @param {Role} role - The role of the user making the request.
   * @param {string} [userId] - The UUID of the user making the request.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
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
    @LogParam('userId') userId: string,
  ): Promise<ModuleContent | StudentContentDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    if (role === 'admin') {
      return (await this.prisma.client.moduleContent.findUniqueOrThrow({
        where: { id },
        include: {
          assignment: true,
        },
      })) as ModuleContent;
    }

    // Default to Student
    return (await this.prisma.client.moduleContent.findUniqueOrThrow({
      where: { id },
      include: {
        assignment: {
          omit: { ...omitAuditDates },
        },
        submissions: {
          where: {
            studentId: userId,
          },
        },
        studentProgress: {
          where: {
            userId: userId,
          },
        },
      },
      omit: { ...omitAuditDates, ...omitPublishFields },
    })) as StudentContentDto;
  }

  /**
   * Updates the details of an existing module content.
   *
   * @async
   * @param {string} id - The UUID of the module content to update
   * @param {UpdateContentDto} updateContentDto - Data Transfer Object containing updated module content details.
   * @param {string} publishedBy - The UUID of the user who published the content, if applicable.
   * @returns {Promise<ModuleContentDto>} The updated module content record.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {ConflictException} If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
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

    const { sectionId, assignment, ...contentData } = updateContentDto;

    const data: Prisma.ModuleContentUpdateInput = {
      ...contentData,
    };

    // Connect section if provided
    if (sectionId) {
      data.moduleSection = { connect: { id: sectionId } };
    }

    // Update assignment if provided
    if (assignment) {
      data.assignment = { update: assignment };
    }

    // Handle publishing
    if (contentData.publishedAt || contentData.toPublishAt) {
      if (publishedBy) {
        data.publishedByUser = { connect: { id: publishedBy } };
      }
    } else {
      // If neither publishedAt nor toPublishAt are set, disconnect
      data.publishedByUser = { disconnect: true };
    }

    return (await this.prisma.client.moduleContent.update({
      where: { id },
      include: {
        assignment: true,
      },
      data,
    })) as ModuleContent;
  }

  /**
   * Deletes a module content from the database.
   *
   * - If `directDelete` is false (or omitted), the content is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the content is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the module content to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<{ message: string }>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Deleting module content with id=${id}, directDelete=${directDelete ?? false}`,
    logSuccessMessage: (_result, { id, directDelete }) =>
      `Successfully deleted module content with id=${id} (${directDelete ? 'permanent' : 'soft'})`,
    logErrorMessage: (err, { id }) =>
      `Failed to delete module content with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module content with ID ${id} not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const content = await this.prisma.client.moduleContent.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !content.deletedAt) {
      await this.prisma.client.moduleContent.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Module content marked for deletion' };
    }

    await this.prisma.client.moduleContent.delete({ where: { id } });
    return { message: 'Module content permanently deleted' };
  }
}
