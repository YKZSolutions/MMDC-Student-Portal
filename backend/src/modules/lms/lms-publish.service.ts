import { Injectable, NotFoundException } from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { Log } from '@/common/decorators/log.decorator';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { UpdatePublishDto } from '@/modules/lms/dto/update-publish.dto';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class LmsPublishService {
  constructor(private lmsContentService: LmsContentService) {}

  /**
   * Publishes a module content from the database.
   *
   * @async
   * @param {string} id - The UUID of the module content to publish.
   * @param {UpdatePublishDto} updatePublishDto - Data Transfer Object containing the publish details.
   * @returns {Promise<{ message: string; data: ModuleContent }>} Publish confirmation message and the updated module content record.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Publishing module content with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully published module content with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to publish module content with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module content with ID ${id} not found`),
  })
  async publishContent(
    id: string,
    updatePublishDto: UpdatePublishDto,
  ): Promise<{ message: string; data: ModuleContent }> {
    const updated = await this.lmsContentService.update(id, updatePublishDto);

    if (updatePublishDto.toPublishAt) {
      return {
        message: 'Module content successfully scheduled for publishing',
        data: updated,
      };
    }

    return {
      message: 'Module content successfully published',
      data: updated,
    };
  }

  /**
   * Unpublishes a module content from the database.
   *
   * @async
   * @param {string} id - The UUID of the module content to unpublish.
   * @returns {Promise<{ message: string; data: ModuleContent }>} Publish confirmation message and the updated module content record.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Unpublishing module content with id=${id}`,
    logSuccessMessage: (result, { id }) =>
      `Successfully unpublished module content with id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to unpublish module content with id=${id} | Error: ${err.message}`,
  })
  async unpublishContent(
    id: string,
  ): Promise<{ message: string; data: ModuleContent }> {
    const updated = await this.lmsContentService.update(id, {
      publishedAt: null,
      toPublishAt: null,
    });

    return {
      message: 'Module content successfully unpublished',
      data: updated,
    };
  }
}
