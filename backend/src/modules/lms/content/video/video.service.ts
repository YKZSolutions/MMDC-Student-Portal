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
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<VideoDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const video = await client.video.create({
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
    @LogParam('videoData') videoData: UpdateVideoDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<VideoDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const video = await client.video.update({
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
   * Removes a video resource by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing video for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `Video for module content ${moduleContentId} hard deleted.`
        : `Video for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing video for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('directDelete') directDelete = false,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<{ message: string }> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    if (directDelete) {
      await client.video.delete({ where: { moduleContentId } });
    } else {
      await client.video.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'Video successfully removed' };
  }
}
