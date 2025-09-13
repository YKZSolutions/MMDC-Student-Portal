import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { CreateModuleSectionDto } from './dto/create-module-section.dto';
import { UpdateModuleSectionDto } from './dto/update-module-section.dto';
import { DetailedModuleSectionDto } from './dto/detailed-module-section.dto';

@Injectable()
export class LmsSectionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) { }

  /**
   * Creates a new module section in the database.
   *
   * @async
   * @param {string} moduleId - The UUID of the module to which the section belongs.
   * @param {CreateModuleSectionDto} dto - Data Transfer Object containing the details of the module section to create.   
   * @returns {Promise<DetailedModuleSectionDto>} - The created course section record
   * @throws {NotFoundException} - If the specified module is not found.
   */
  @Log({
    logArgsMessage: ({ moduleId }) =>
      `Creating module section for module ${moduleId}`,
    logSuccessMessage: (_, { moduleId }) =>
      `Created module section for module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Creating module section for module ${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: (_, { moduleId }) =>
      new NotFoundException(`Module ${moduleId} not found`),
  })
  async create(
    @LogParam('moduleId') moduleId: string,
    dto: CreateModuleSectionDto,
  ): Promise<DetailedModuleSectionDto> {
    return this.prisma.client.moduleSection.create({
      data: { moduleId, ...dto },
    });
  }

  /**
   * Retrieves all module sections for a given module, including nested subsections.
   *
   * @async
   * @param {string} moduleId - The UUID of the module
   * @returns {Promise<DetailedModuleSectionDto[]>} - A list of module sections with their nested subsections.
   * @throws {NotFoundException} - If the specified module is not found.
   */
  @Log({
    logArgsMessage: ({ moduleId }) =>
      `Fetching module sections for module ${moduleId}`,
    logSuccessMessage: (_, { moduleId }) =>
      `Feteched module sections for module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Fetching module section for module ${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { moduleId }) =>
      new NotFoundException(`Module ${moduleId} not found`),
  })
  async findByModuleId(
    @LogParam('moduleId') moduleId: string,
  ): Promise<DetailedModuleSectionDto[]> {
    return this.prisma.client.moduleSection.findMany({
      // Top level section e.g. Week 1
      where: {
        moduleId,
      },
      // Could include module contents
      include: {
        // Nested subsection e.g. Overview
        subsections: {
          include: {
            subsections: true, // Could represent 'Exceptations', 'Expected Output', etc.,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  /**
   * Updates the details of an existing module section.
   * 
   * @async
   * @param {string} moduleSectionId - The UUID of the module section to update.
   * @param {UpdateModuleSectionDto} dto - Data Transfer Object containing the updated module section details. 
   * @returns {Promise<DetailedModuleSectionDto>} - The updated module section
   * @throws {NotFoundException} - If the specified module section is not found.
   */
  @Log({
    logArgsMessage: ({ moduleSectionId }) =>
      `Updating module section ${moduleSectionId}`,
    logSuccessMessage: (moduleSection, { moduleSectionId }) =>
      `Updated module section ${moduleSectionId} ${moduleSection.title}`,
    logErrorMessage: (err, { moduleSectionId }) =>
      `Updating module section ${moduleSectionId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { moduleSectionId }) => new NotFoundException(`Module section ${moduleSectionId} not found`)
  })
  async update(@LogParam('moduleSectionId') moduleSectionId: string, dto: UpdateModuleSectionDto): Promise<DetailedModuleSectionDto> {
    return this.prisma.client.moduleSection.update({
      where: {
        id: moduleSectionId
      }, data: {
        ...dto
      }
    })
  }

  /**
   * Delets a module section from the database.
   * 
   * - If `directDelete` is false (or omitted), the module section is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the module section is permanently deleted.
   * 
   * @async
   * @param {string} moduleSectionId - The UUID of the module section to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the module.
   * @returns {Promise<{message: string}>} - Deletion confirmation message.
   * @throws {NotFoundException} - If no module section is found with the given id.
   */
  @Log({
    logArgsMessage: ({ moduleSectionId, directDelete }) =>
      `Deleting module section ${moduleSectionId} hard delete=${directDelete ?? false}`,
    logSuccessMessage: (_, { moduleSectionId, directDelete }) =>
      `Deleted module section ${moduleSectionId} hard delete=${directDelete ?? false}`,
    logErrorMessage: (err, { moduleSectionId }) =>
      `Deleting module section ${moduleSectionId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, {moduleSectionId}) => new NotFoundException(`Module section ${moduleSectionId} not found`)
  })
  async remove(@LogParam('moduleSectionId') moduleSectionId: string, @LogParam('directDelete') directDelete?: boolean): Promise<{ message: string }> {
    const moduleSection = await this.prisma.client.moduleSection.findUniqueOrThrow({
      where: { id: moduleSectionId }
    })

    const now = new Date();

    if (!directDelete && !moduleSection.deletedAt) {
      await this.prisma.client.$transaction([
        this.prisma.client.moduleSection.update({
          where: { id: moduleSectionId },
          data: {
            deletedAt: now
          }
        }),
        this.prisma.client.moduleContent.updateMany({
          where: { moduleSectionId: moduleSectionId },
          data: {
            deletedAt: now
          }
        })
      ])

      return {
        message: `Module section "${moduleSectionId}" and all associated contents were marked as deleted.`,
      };

    }

    await this.prisma.client.moduleSection.delete({ where: { id: moduleSectionId } })
    return {
      message: `Module section "${moduleSectionId}" and all associated contents were permanently deleted.`,
    };
  }
}
