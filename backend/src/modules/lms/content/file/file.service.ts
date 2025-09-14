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
import { FileResourceDto } from '@/generated/nestjs-dto/fileResource.dto';
import { CreateFileResourceDto } from '@/generated/nestjs-dto/create-fileResource.dto';
import { UpdateFileResourceDto } from '@/generated/nestjs-dto/update-fileResource.dto';

@Injectable()
export class FileService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new file resource linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating file resource for module content ${moduleContentId}`,
    logSuccessMessage: (file) =>
      `File resource [${file.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating file resource for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'File resource already exists for this module content',
      ),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('fileData') fileData: CreateFileResourceDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<FileResourceDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const file = await client.fileResource.create({
      data: {
        ...fileData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...file,
      content: file.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing file resource
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating file resource for module content ${moduleContentId}`,
    logSuccessMessage: (file) =>
      `File resource [${file.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating file resource for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('File resource not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('fileData') fileData: UpdateFileResourceDto,
    @LogParam('transactionClient')
    tx?: PrismaTransaction,
  ): Promise<FileResourceDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const client = tx ?? this.prisma.client;
    const file = await client.fileResource.update({
      where: { moduleContentId },
      data: fileData,
    });

    return {
      ...file,
      content: file.content as Prisma.JsonValue,
    };
  }

  /**
   * Finds a file resource by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding file resource for module content ${moduleContentId}`,
    logSuccessMessage: (file) =>
      `File resource [${file.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding file resource for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('File resource not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<FileResourceDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const file = await this.prisma.client.fileResource.findUniqueOrThrow({
      where: { moduleContentId },
    });

    return {
      ...file,
      content: file.content as Prisma.JsonValue,
    };
  }

  /**
   * Removes a file resource by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing file resource for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `File resource for module content ${moduleContentId} hard deleted.`
        : `File resource for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing file resource for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
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
      await client.fileResource.delete({ where: { moduleContentId } });
    } else {
      await client.fileResource.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'File resource successfully removed' };
  }
}
