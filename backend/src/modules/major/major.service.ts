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
import { MessageDto } from '@/common/dto/message.dto';

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
    logArgsMessage: ({ dto }: { dto: CreateProgramMajorDto }) =>
      `Create major name=${dto.major.name} programId=${dto.programId}`,
    logSuccessMessage: (result) =>
      `Created major name=${result.name} id=${result.id}`,
    logErrorMessage: (err, { dto }: { dto: CreateProgramMajorDto }) =>
      `Failed to create major name=${dto.major.name} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (
      _,
      { dto }: { dto: CreateProgramMajorDto },
    ) => new ConflictException(`Major name already exists: ${dto.major.name}`),
  })
  async create(
    @LogParam('dto') createProgramMajorDto: CreateProgramMajorDto,
  ): Promise<MajorDto> {
    return await this.prisma.client.major.create({
      data: {
        ...createProgramMajorDto.major,
        program: {
          connect: { id: createProgramMajorDto.programId },
        },
      },
    });
  }

  /**
   * Retrieves all majors under the specified programId matching the provided filters, with pagination support.
   *
   * @async
   * @param {BaseFilterDto} filters - Filter and pagination options (e.g., search keyword, page number).
   * @param programId - The ID of the program to filter by.
   * @returns {Promise<PaginatedMajorsDto>} - Paginated list of programs with metadata.
   *
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Find all majors filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Found ${result.majors.length} majors`,
    logErrorMessage: (err, { filters }) =>
      `Failed to find majors filters=${JSON.stringify(filters)} | Error=${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
    @LogParam('programId') programId?: string,
  ): Promise<PaginatedMajorsDto> {
    const where: Prisma.MajorWhereInput = {
      deletedAt: null,
    };
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
   * Retrieves a single major by its unique ID.
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
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Major not found`),
  })
  async findOne(@LogParam('id') id: string): Promise<MajorItemDto> {
    return await this.prisma.client.major.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
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
    logArgsMessage: ({ id, dto }: { id: string; dto: UpdateMajorDto }) =>
      `Update major id=${id} name=${dto?.name}`,
    logSuccessMessage: (_, { id }) => `Updated major id=${id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update major id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Major not found`),
    [PrismaErrorCode.UniqueConstraint]: (_, { dto }: { dto: UpdateMajorDto }) =>
      new ConflictException(`Major name already exists: ${dto?.name}`),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') updateMajorDto: UpdateMajorDto,
  ): Promise<MajorDto> {
    return await this.prisma.client.major.update({
      where: { id, deletedAt: null },
      data: { ...updateMajorDto },
    });
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
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Major with not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<MessageDto> {
    return await this.prisma.client.$transaction(async (tx) => {
      const major = await tx.major.findFirstOrThrow({
        where: { id },
      });

      if (!directDelete && !major.deletedAt) {
        await tx.major.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        return new MessageDto('Major marked for deletion');
      }

      await tx.major.delete({ where: { id } });

      return new MessageDto('Major permanently deleted');
    });
  }
}
