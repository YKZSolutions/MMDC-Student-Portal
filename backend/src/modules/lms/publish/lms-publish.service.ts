import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { MessageDto } from '@/common/dto/message.dto';

/**
 * Service responsible for handling publishing and unpublishing of LMS modules and sections.
 * Provides functionality to manage the publication status of learning content.
 */
@Injectable()
export class LmsPublishService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Publishes a module and all its contents immediately or schedules it for future publication.
   * @param moduleId - The ID of the module to publish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the module with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ moduleId }) => `Publishing module with id=${moduleId}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Successfully published module with id=${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Failed to publish module with id=${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module with ID ${id} not found`),
  })
  async publishModule(
    @LogParam('moduleId') moduleId: string,
  ): Promise<MessageDto> {
    const publishPayload = { publishedAt: new Date(), unpublishedAt: null };

    // Use a transaction to ensure all updates succeed or fail together
    await this.prisma.client.$transaction(async (tx) => {
      await tx.module.update({
        where: { id: moduleId },
        data: publishPayload,
      });

      await tx.moduleSection.updateMany({
        where: {
          moduleId: moduleId,
        },
        data: publishPayload,
      });

      await tx.moduleContent.updateMany({
        where: {
          moduleSection: {
            moduleId: moduleId,
          },
        },
        data: publishPayload,
      });
    });

    return new MessageDto('Module published successfully');
  }

  /**
   * Unpublishes a module and all its contents immediately.
   * @param moduleId - The ID of the module to unpublish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the module with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ moduleId }) => `Unpublishing module with id=${moduleId}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Successfully unpublished module with id=${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Failed to unpublish module with id=${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { moduleId }) =>
      new NotFoundException(`Module with ID ${moduleId} not found`),
  })
  async unpublishModule(
    @LogParam('moduleId') moduleId: string,
  ): Promise<{ message: string }> {
    const unpublishPayload = { publishedAt: null, unpublishAt: new Date() };

    // Use a transaction to ensure all updates succeed or fail together
    await this.prisma.client.$transaction(async (tx) => {
      await tx.module.update({
        where: { id: moduleId },
        data: unpublishPayload,
      });

      await tx.moduleSection.updateMany({
        where: {
          moduleId: moduleId,
        },
        data: unpublishPayload,
      });

      await tx.moduleContent.updateMany({
        where: {
          moduleSection: {
            moduleId: moduleId,
          },
        },
        data: unpublishPayload,
      });
    });

    return new MessageDto('Module unpublished successfully');
  }

  /**
   * Publishes a section and all its subsections immediately or schedules it for future publication.
   * @param sectionId - The ID of the section to publish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the section with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ sectionId }) =>
      `Publishing section with id=${sectionId}`,
    logSuccessMessage: (result, { sectionId }) =>
      `Successfully published section with id=${sectionId}`,
    logErrorMessage: (err, { sectionId }) =>
      `Failed to publish section with id=${sectionId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { sectionId }) =>
      new NotFoundException(`Section with ID ${sectionId} not found`),
  })
  async publishSection(
    @LogParam('sectionId') sectionId: string,
  ): Promise<MessageDto> {
    const publishPayload = { publishedAt: new Date(), unpublishedAt: null };

    // Use a transaction to ensure all updates succeed or fail together
    await this.prisma.client.$transaction(async (tx) => {
      await tx.moduleSection.updateMany({
        where: {
          id: sectionId,
        },
        data: publishPayload,
      });

      await tx.moduleContent.updateMany({
        where: {
          moduleSection: {
            id: sectionId,
          },
        },
        data: publishPayload,
      });
    });

    return new MessageDto('Section published successfully');
  }

  /**
   * Unpublishes a section and all its subsections immediately.
   * @param sectionId - The ID of the section to unpublish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the section with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ sectionId }) =>
      `Unpublishing section with id=${sectionId}`,
    logSuccessMessage: (result, { sectionId }) =>
      `Successfully unpublished section with id=${sectionId}`,
    logErrorMessage: (err, { sectionId }) =>
      `Failed to unpublish section with id=${sectionId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { sectionId }) =>
      new NotFoundException(`Section with ID ${sectionId} not found`),
  })
  async unpublishSection(
    @LogParam('sectionId') sectionId: string,
  ): Promise<MessageDto> {
    const unpublishPayload = { publishedAt: null, unpublishedAt: new Date() };

    // Use a transaction to ensure all updates succeed or fail together
    await this.prisma.client.$transaction(async (tx) => {
      await tx.moduleSection.updateMany({
        where: {
          id: sectionId,
        },
        data: unpublishPayload,
      });

      await tx.moduleContent.updateMany({
        where: {
          moduleSection: {
            id: sectionId,
          },
        },
        data: unpublishPayload,
      });
    });

    return new MessageDto('Section unpublished successfully');
  }

  @Log({
    logArgsMessage: ({ contentId }) =>
      `Publishing content with id=${contentId}`,
    logSuccessMessage: (result, { contentId }) =>
      `Successfully published content with id=${contentId}`,
    logErrorMessage: (err, { contentId }) =>
      `Failed to publish content with id=${contentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { contentId }) =>
      new NotFoundException(`Content with ID ${contentId} not found`),
  })
  async publishContent(
    @LogParam('contentId') contentId: string,
  ): Promise<MessageDto> {
    const publishPayload = { publishedAt: new Date(), unpublishedAt: null };

    await this.prisma.client.moduleContent.update({
      where: { id: contentId },
      data: publishPayload,
    });

    return { message: 'Content published successfully' };
  }

  @Log({
    logArgsMessage: ({ contentId }) =>
      `Unpublishing content with id=${contentId}`,
    logSuccessMessage: (result, { contentId }) =>
      `Successfully unpublished content with id=${contentId}`,
    logErrorMessage: (err, { contentId }) =>
      `Failed to unpublish content with id=${contentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { contentId }) =>
      new NotFoundException(`Content with ID ${contentId} not found`),
  })
  async unpublishContent(
    @LogParam('contentId') contentId: string,
  ): Promise<MessageDto> {
    const unpublishPayload = { publishedAt: null, unpublishedAt: null };

    await this.prisma.client.moduleContent.update({
      where: { id: contentId },
      data: unpublishPayload,
    });

    return { message: 'Content unpublished successfully' };
  }
}
