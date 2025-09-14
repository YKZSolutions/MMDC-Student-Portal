// url.service.ts
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient, PrismaTransaction, } from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { PrismaError, PrismaErrorCode, } from '@/common/decorators/prisma-error.decorator';
import { CreateExternalUrlDto } from '@/generated/nestjs-dto/create-externalUrl.dto';
import { ExternalUrlDto } from '@/generated/nestjs-dto/externalUrl.dto';
import { UpdateExternalUrlDto } from '@/generated/nestjs-dto/update-externalUrl.dto';

@Injectable()
export class UrlService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new external URL resource linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating external URL for module content ${moduleContentId}`,
    logSuccessMessage: (url) =>
      `External URL [${url.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating external URL for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'External URL already exists for this module content',
      ),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('urlData') urlData: CreateExternalUrlDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<ExternalUrlDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const url = await client.externalUrl.create({
      data: {
        ...urlData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...url,
      content: url.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing external URL resource
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating external URL for module content ${moduleContentId}`,
    logSuccessMessage: (url) =>
      `External URL [${url.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating external URL for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('External URL not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('urlData') urlData: UpdateExternalUrlDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<ExternalUrlDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const url = await client.externalUrl.update({
      where: { moduleContentId },
      data: urlData,
    });

    return {
      ...url,
      content: url.content as Prisma.JsonValue,
    };
  }

  /**
   * Finds an external URL by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding external URL for module content ${moduleContentId}`,
    logSuccessMessage: (url) =>
      `External URL [${url.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding external URL for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('External URL not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<ExternalUrlDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const url = await this.prisma.client.externalUrl.findUniqueOrThrow({
      where: { moduleContentId },
    });

    return {
      ...url,
      content: url.content as Prisma.JsonValue,
    };
  }

  /**
   * Removes an external URL resource by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing external URL for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `External URL for module content ${moduleContentId} hard deleted.`
        : `External URL for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing external URL for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
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
      await client.externalUrl.delete({ where: { moduleContentId } });
    } else {
      await client.externalUrl.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'External URL successfully removed' };
  }
}
