// video.service.ts
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { PrismaError, PrismaErrorCode, } from '@/common/decorators/prisma-error.decorator';
import { CreateVideoDto } from '@/generated/nestjs-dto/create-video.dto';
import { VideoDto } from '@/generated/nestjs-dto/video.dto';
import { UpdateVideoDto } from '@/generated/nestjs-dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new video resource linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating video for module content ${moduleContentId}`,
    logSuccessMessage: (video) =>
      `Video [${video.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating video for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Video already exists for this module content'),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('videoData') videoData: CreateVideoDto,
  ): Promise<VideoDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const video = await this.prisma.client.video.create({
      data: {
        ...videoData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...video,
      content: video.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing video resource
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating video for module content ${moduleContentId}`,
    logSuccessMessage: (video) =>
      `Video [${video.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating video for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Video not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('videoData')
    videoData: UpdateVideoDto,
  ): Promise<VideoDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const video = await this.prisma.client.video.update({
      where: { moduleContentId },
      data: videoData,
    });

    return {
      ...video,
      content: video.content as Prisma.JsonValue,
    };
  }

  /**
   * Finds a video by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding video for module content ${moduleContentId}`,
    logSuccessMessage: (video) => `Video [${video.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding video for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Video not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<VideoDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const video = await this.prisma.client.video.findUniqueOrThrow({
      where: { moduleContentId },
    });

    return {
      ...video,
      content: video.content as Prisma.JsonValue,
    };
  }

  /**
   * Deletes a video resource
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Deleting video for module content ${moduleContentId}`,
    logSuccessMessage: () => 'Video successfully deleted.',
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while deleting video for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Video not found'),
  })
  async delete(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    await this.prisma.client.video.delete({
      where: { moduleContentId },
    });

    return { message: 'Video successfully deleted' };
  }
}
