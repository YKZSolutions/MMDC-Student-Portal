import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { ModuleSection } from '@/generated/nestjs-dto/moduleSection.entity';
import { LogParam } from '@/common/decorators/log-param.decorator';

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
   * @param id - The ID of the module to publish
   * @param toPublishAt - Optional future date to schedule publication. If not provided, publishes immediately.
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the module with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ id }) => `Publishing module with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully published module with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to publish module with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module with ID ${id} not found`),
  })
  async publishModule(
    @LogParam('id') id: string,
    @LogParam('toPublishAt') toPublishAt?: Date | null,
  ): Promise<{ message: string }> {
    const publishPayload = toPublishAt
      ? { toPublishAt }
      : { publishedAt: new Date(), toPublishAt: null };

    // Update module
    await this.prisma.client.module.update({
      where: { id },
      data: publishPayload,
    });

    // Update sections recursively
    const sections: ModuleSection[] =
      await this.prisma.client.moduleSection.findMany({
        where: { moduleId: id },
        include: { subsections: { include: { subsections: true } } },
      });

    const publishSectionRecursive = async (section: ModuleSection) => {
      await this.prisma.client.moduleSection.update({
        where: { id: section.id },
        data: publishPayload,
      });

      if (section.subsections?.length) {
        for (const sub of section.subsections) {
          await publishSectionRecursive(sub);
        }
      }
    };

    for (const section of sections) {
      await publishSectionRecursive(section);
    }

    // Update contents
    const contents = await this.prisma.client.moduleContent.findMany({
      where: { moduleId: id },
    });
    for (const content of contents) {
      await this.prisma.client.moduleContent.update({
        where: { id: content.id },
        data: publishPayload,
      });
    }
    return { message: 'Module published successfully' };
  }

  /**
   * Unpublishes a module and all its contents immediately.
   * @param id - The ID of the module to unpublish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the module with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ id }) => `Unpublishing module with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully unpublished module with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to unpublish module with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module with ID ${id} not found`),
  })
  async unpublishModule(
    @LogParam('id') id: string,
  ): Promise<{ message: string }> {
    const unpublishPayload = { publishedAt: null, toPublishAt: null };

    // Update module
    await this.prisma.client.module.update({
      where: { id },
      data: unpublishPayload,
    });

    // Update sections recursively
    const sections: ModuleSection[] =
      await this.prisma.client.moduleSection.findMany({
        where: { moduleId: id },
        include: { subsections: { include: { subsections: true } } },
      });

    const unpublishSectionRecursive = async (section: ModuleSection) => {
      await this.prisma.client.moduleSection.update({
        where: { id: section.id },
        data: unpublishPayload,
      });

      if (section.subsections?.length) {
        for (const sub of section.subsections) {
          await unpublishSectionRecursive(sub);
        }
      }
    };

    for (const section of sections) {
      await unpublishSectionRecursive(section);
    }

    // Update contents
    const contents = await this.prisma.client.moduleContent.findMany({
      where: { moduleId: id },
    });
    for (const content of contents) {
      await this.prisma.client.moduleContent.update({
        where: { id: content.id },
        data: unpublishPayload,
      });
    }
    return { message: 'Module unpublished successfully' };
  }

  /**
   * Publishes a section and all its subsections immediately or schedules it for future publication.
   * @param id - The ID of the section to publish
   * @param toPublishAt - Optional future date to schedule publication. If not provided, publishes immediately.
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the section with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ id }) => `Publishing section with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully published section with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to publish section with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Section with ID ${id} not found`),
  })
  async publishSection(
    @LogParam('id') id: string,
    @LogParam('toPublishAt') toPublishAt?: Date | null,
  ): Promise<{ message: string }> {
    const publishPayload = toPublishAt
      ? { toPublishAt }
      : { publishedAt: new Date(), toPublishAt: null };

    // Update section and its subsections recursively
    const section: ModuleSection =
      await this.prisma.client.moduleSection.findUniqueOrThrow({
        where: { id },
        include: { subsections: { include: { subsections: true } } },
      });

    const publishSectionRecursive = async (section: ModuleSection) => {
      await this.prisma.client.moduleSection.update({
        where: { id: section.id },
        data: publishPayload,
      });
      if (section.subsections?.length) {
        for (const sub of section.subsections) {
          await publishSectionRecursive(sub);
        }
      }
    };
    await publishSectionRecursive(section);

    // Update related contents
    const contents = await this.prisma.client.moduleContent.findMany({
      where: { moduleSectionId: id },
    });
    for (const content of contents) {
      await this.prisma.client.moduleContent.update({
        where: { id: content.id },
        data: publishPayload,
      });
    }
    return { message: 'Section published successfully' };
  }

  /**
   * Unpublishes a section and all its subsections immediately.
   * @param id - The ID of the section to unpublish
   * @returns A promise that resolves with a success message
   * @throws {NotFoundException} When the section with the specified ID is not found
   */
  @Log({
    logArgsMessage: ({ id }) => `Unpublishing section with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully unpublished section with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to unpublish section with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Section with ID ${id} not found`),
  })
  async unpublishSection(
    @LogParam('id') id: string,
  ): Promise<{ message: string }> {
    const unpublishPayload = { publishedAt: null, toPublishAt: null };
    const section: ModuleSection =
      await this.prisma.client.moduleSection.findUniqueOrThrow({
        where: { id },
        include: { subsections: { include: { subsections: true } } },
      });

    const unpublishSectionRecursive = async (section: ModuleSection) => {
      await this.prisma.client.moduleSection.update({
        where: { id: section.id },
        data: unpublishPayload,
      });
      if (section.subsections?.length) {
        for (const sub of section.subsections) {
          await unpublishSectionRecursive(sub);
        }
      }
    };
    await unpublishSectionRecursive(section);

    // Update related contents
    const contents = await this.prisma.client.moduleContent.findMany({
      where: { moduleSectionId: id },
    });
    for (const content of contents) {
      await this.prisma.client.moduleContent.update({
        where: { id: content.id },
        data: unpublishPayload,
      });
    }

    return { message: 'Section unpublished successfully' };
  }

  @Log({
    logArgsMessage: ({ id }) => `Publishing content with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully published content with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to publish content with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Content with ID ${id} not found`),
  })
  async publishContent(
    @LogParam('id') id: string,
    @LogParam('toPublishAt') toPublishAt?: Date | null,
  ): Promise<{ message: string }> {
    const publishPayload = toPublishAt
      ? { toPublishAt }
      : { publishedAt: new Date(), toPublishAt: null };
    await this.prisma.client.moduleContent.update({
      where: { id },
      data: publishPayload,
    });

    return { message: 'Content published successfully' };
  }

  @Log({
    logArgsMessage: ({ id }) => `Unpublishing content with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully unpublished content with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to unpublish content with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Content with ID ${id} not found`),
  })
  async unpublishContent(id: string): Promise<{ message: string }> {
    const unpublishPayload = { publishedAt: null, toPublishAt: null };
    await this.prisma.client.moduleContent.update({
      where: { id },
      data: unpublishPayload,
    });

    return { message: 'Content unpublished successfully' };
  }
}
