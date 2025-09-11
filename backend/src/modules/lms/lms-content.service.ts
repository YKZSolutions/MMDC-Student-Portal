import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { isUUID } from 'class-validator';
import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { Prisma } from '@prisma/client';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { Role } from '@/common/enums/roles.enum';

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
   * @param {string} [moduleSectionId] - The UUID of the module section to which the content belongs. If not provided, the content will be created in the default section.
   * @returns {Promise<ModuleContentDto>} The created module content record
   *
   * @throws {ConflictException} - If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ content }) =>
      `Creating module content [${content.title}] in section ${content.moduleSectionId}`,
    logSuccessMessage: (content) =>
      `Module content [${content.title}] successfully created.`,
    logErrorMessage: (err, { content }) =>
      `An error has occurred while creating module content [${content.title}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Module content title already exists in this section.',
      ),
  })
  async create(
    @LogParam('content') createModuleContentDto: CreateModuleContentDto,
    @LogParam('moduleId') moduleId: string,
    @LogParam('moduleSectionId') moduleSectionId?: string,
  ): Promise<ModuleContentDto> {
    const data: Prisma.ModuleContentCreateInput = {
      ...createModuleContentDto,
      module: { connect: { id: moduleId } },
      moduleSection: { connect: { id: moduleSectionId } },
    };

    //TODO: add content creation based on type
    return (await this.prisma.client.moduleContent.create({
      data,
      include: {
        module: true,
        moduleSection: true,
      },
    })) as ModuleContentDto;
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
    @LogParam('userId') userId?: string,
  ): Promise<ModuleContentDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    if (role === Role.ADMIN) {
      return (await this.prisma.client.moduleContent.findUniqueOrThrow({
        where: { id },
        include: {
          assignment: true,
        },
      })) as ModuleContentDto;
    }

    //Default to Student
    return await this.prisma.client.moduleContent.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        contentType: true,
        moduleId: true,
        moduleSectionId: true,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            type: true,
            points: true,
            rubric: true,
            mode: true,
            maxAttempts: true,
          },
        },
      },
    });
  }

  /**
   * Updates the details of an existing module content.
   *
   * @async
   * @param {string} id - The UUID of the module content to update.
   * @param {UpdateContentDto} updateContentDto - Data Transfer Object containing updated module content details.
   * @returns {Promise<ModuleContentDto>} The updated module content record.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {ConflictException} If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating module content for id ${id}`,
    logSuccessMessage: (id) =>
      `Successfully updated module content for id ${id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while updating module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module content not found for Id ${id}`),
    [PrismaErrorCode.UniqueConstraint]: (_, { content }) =>
      new ConflictException(
        `Module content title ${content.title} already exists in this section`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('content') updateContentDto: UpdateContentDto,
  ): Promise<ModuleContentDto> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Module content with ID ${id} not found.`);
    }
    const { sectionId, ...contentData } = updateContentDto;

    const data: Prisma.ModuleContentUpdateInput = {
      ...contentData,
    };

    if (sectionId) {
      data.moduleSection = { connect: { id: sectionId } };
    }

    return (await this.prisma.client.moduleContent.update({
      where: { id },
      include: {
        module: true,
        moduleSection: true,
        assignment: true,
      },
      data,
    })) as ModuleContentDto;
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
