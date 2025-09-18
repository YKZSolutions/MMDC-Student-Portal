import { UpdateMajorDto } from '@/generated/nestjs-dto/update-major.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { PaginatedMajorsDto } from './dto/paginated-major.dto';
import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CreateProgramMajorDto } from './dto/create-major.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { MajorItemDto } from './dto/major-item.dto';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class MajorService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new academic major in the database.
   *
   * @async
   * @param {CreateProgramMajorDto} createProgramMajorDto - Data Transfer Object containing major details to create.
   * @returns {Promise<MajorDto>} The created major record.
   *
   * @throws {ConflictException} - If the major name already exists.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ dto }) =>
      `Create major name=${dto.major.name} programId=${dto.programId}`,
    logSuccessMessage: (result, { dto }) =>
      `Created major name=${dto.major.name} id=${result.id}`,
    logErrorMessage: (err, { dto }) =>
      `Failed to create major name=${dto.major.name} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (_, { dto }) =>
      new ConflictException(`Major name already exists: ${dto.major.name}`),
  })
  async create(
    @LogParam('dto') createProgramMajorDto: CreateProgramMajorDto,
  ): Promise<MajorDto> {
    const major = await this.prisma.client.major.create({
      data: {
        ...createProgramMajorDto.major,
        program: {
          connect: { id: createProgramMajorDto.programId },
        },
      },
    });
    return major;
  }

  /**
   * Retrives all majors under the specified programId matching the provided filters, with pagination support.
   *
   * @async
   * @param {FilterMajorDto} filters - Filter and pagination options (e.g., search keyword, page number).
   * @returns {Promise<PaginatedMajorsDto>} - Paginated list of programs with metadata.
   *
   * @throws {BadRequestException} If the query paramters are invalid.
   * @throws {NotFoundException} If no majors are found.
   * @throws {Error} Any other unexpected erros.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Find all majors filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Found ${result.majors.length} majors`,
    logErrorMessage: (err, { filters }) =>
      `Failed to find majors filters=${JSON.stringify(filters)} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('No majors found'),
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
    programId?: string,
  ): Promise<PaginatedMajorsDto> {
    const where: Prisma.MajorWhereInput = {};
    const page = filters.page || 1;

    if (programId) {
      where.programId = programId;
    }

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

    const [majors, meta] = await this.prisma.client.major
      .paginate({
        where,
      })
      .withPages({ limit: 10, page, includePageCount: true });

    return { majors, meta };
  }

  /**
   * Retrieves a single major by it's unique ID.
   *
   * @async
   * @param {string} id - The UUID of the major.
   * @returns {Promise<ProgramDto>} The major record.
   *
   * @throws {NotFoundException} If no major is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Find major by ID=${id}`,
    logSuccessMessage: (result) => `Found major id=${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to find major id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Major with ID ${id} not found`),
  })
  async findOne(@LogParam('id') id: string): Promise<MajorItemDto> {
    const major = await this.prisma.client.major.findUniqueOrThrow({
      where: { id },
    });

    return major;
  }

  /**
   * Updates the details of an existing major.
   *
   * @async
   * @param {string} id - The UUID of the major to update.
   * @param {UpdateMajorDto} updateMajorDto - Data Transfer Object containing updated major details.
   * @returns {Promise<ProgramDto>} The updated major record.
   *
   * @throws {NotFoundException} If no major is found with the given ID.
   * @throws {ConflictException} If the major name already exists.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, dto }) => `Update major id=${id} name=${dto.name}`,
    logSuccessMessage: (_, { id }) => `Updated major id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update major id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Major with ID ${id} not found`),
    [PrismaErrorCode.UniqueConstraint]: (_, { dto }) =>
      new ConflictException(`Major name already exists: ${dto.name}`),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') updateMajorDto: UpdateMajorDto,
  ): Promise<MajorDto> {
    const major = await this.prisma.client.major.update({
      where: { id },
      data: { ...updateMajorDto },
    });

    return major;
  }

  /**
   * Deletes a major from the database.
   *
   * - If `directDelete` is false (or omitted), the major is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the major is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the major to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<{ message: string }>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no major is found with the given ID (`P2025`).
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Remove major id=${id}, directDelete=${directDelete}`,
    logSuccessMessage: (result, { id }) =>
      `Removed major id=${id}, message="${result.message}"`,
    logErrorMessage: (err, { id }) =>
      `Failed to remove major id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Major with ID ${id} not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const major = await this.prisma.client.major.findFirstOrThrow({
      where: { id },
    });

    if (!directDelete && !(await major).deletedAt) {
      await this.prisma.client.major.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Major marked for deletion' };
    }

    await this.prisma.client.major.delete({ where: { id } });
    return {
      message: 'Major permanently deleted',
    };
  }
}
