import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { YearLevelDto } from '@/generated/nestjs-dto/yearLevel.dto';
import { PaginatedYearLevelsDto } from './dto/paginated-year-level.dto';
import { Prisma } from '@prisma/client';
import { CreateYearLevelDto } from '@/generated/nestjs-dto/create-yearLevel.dto';
import { UpdateYearLevelDto } from '@/generated/nestjs-dto/update-yearLevel.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class YearLevelService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ dto }) =>
      `Create year level name=${dto.name} levelOrder=${dto.levelOrder}`,
    logSuccessMessage: (result) =>
      `Created year level id=${result.id} name=${result.name} levelOrder=${result.levelOrder}`,
    logErrorMessage: (err, { dto }) =>
      `Create year level name=${dto.name} levelOrder=${dto.levelOrder} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (_, { dto }) =>
      new ConflictException(
        `Year level creation failed: name=${dto.name} already exists`,
      ),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Year level creation failed due to transaction deadlock',
      ),
  })
  async create(
    @LogParam('dto') createYearLevelDto: CreateYearLevelDto,
  ): Promise<YearLevelDto> {
    return await this.prisma.client.yearLevel.create({
      data: createYearLevelDto,
    });
  }

  @Log({
    logArgsMessage: ({ filters }) =>
      `Find year levels with filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Found ${result.yearLevels.length} year levels`,
    logErrorMessage: (err, { filters }) =>
      `Failed to find year levels filters=${JSON.stringify(filters)} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('No year levels found'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Finding year levels failed due to transaction deadlock',
      ),
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedYearLevelsDto> {
    const where: Prisma.YearLevelWhereInput = {};
    const page = Number(filters?.page) || 1;

    where.deletedAt = null;

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            name: { contains: term, mode: Prisma.QueryMode.insensitive },
          },
          {
            description: {
              contains: term,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }));
    }

    const [yearLevels, meta] = await this.prisma.client.yearLevel
      .paginate({
        where,
        orderBy: {
          levelOrder: 'asc',
        },
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });

    return { yearLevels, meta };
  }

  @Log({
    logArgsMessage: ({ id }) => `Find year level by id=${id}`,
    logSuccessMessage: (result) =>
      `Found year level id=${result.id} name=${result.name}`,
    logErrorMessage: (err, { id }) =>
      `Failed to find year level id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Year level with id=${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Finding year level failed due to transaction deadlock',
      ),
  })
  async findOne(@LogParam('id') id: string): Promise<YearLevelDto> {
    return await this.prisma.client.yearLevel.findUniqueOrThrow({
      where: { id },
    });
  }

  @Log({
    logArgsMessage: ({ id, dto }) =>
      `Update year level id=${id} payload=${JSON.stringify(dto)}`,
    logSuccessMessage: (result) =>
      `Updated year level id=${result.id} name=${result.name}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update year level id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Year level with id=${id} not found`),
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Year level name already exists'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Updating year level failed due to transaction deadlock',
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') updateYearLevelDto: UpdateYearLevelDto,
  ): Promise<YearLevelDto> {
    return await this.prisma.client.yearLevel.update({
      where: { id },
      data: { ...updateYearLevelDto },
    });
  }

  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Remove year level id=${id} directDelete=${directDelete ?? false}`,
    logSuccessMessage: (result, { id }) =>
      `Removed year level id=${id}, message="${result.message}"`,
    logErrorMessage: (err, { id, directDelete }) =>
      `Failed to remove year level id=${id} directDelete=${directDelete ?? false} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Year level with id=${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Deleting year level failed due to transaction deadlock',
      ),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const yearLevel = await this.prisma.client.yearLevel.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !yearLevel.deletedAt) {
      await this.prisma.client.yearLevel.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: 'Year level marked for deletion.' };
    }

    await this.prisma.client.yearLevel.delete({
      where: { id },
    });

    return {
      message: 'Year level deleted permanently',
    };
  }
}
