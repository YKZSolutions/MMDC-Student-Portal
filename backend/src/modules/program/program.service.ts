import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { ProgramDto } from '@/generated/nestjs-dto/program.dto';
import { PaginatedProgramsDto } from './dto/paginated-program.dto';
import { Prisma } from '@prisma/client';
import { CreateProgramDto } from '@/generated/nestjs-dto/create-program.dto';
import { UpdateProgramDto } from '@/generated/nestjs-dto/update-program.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class ProgramService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new academic program in the database.
   *
   * @async
   * @param {CreateProgramDto} createProgramDto - Data Transfer Object containing program details to create.
   * @returns {Promise<ProgramDto>} The created program record.
   *
   * @throws {ConflictException} If the program code or name already exists (`P2002`).
   * @throws {ServiceUnavailableException} If database connection fails.
   * @throws {Error} Any other unexpected errors.
   */

  @Log({
    logArgsMessage: ({ dto }) =>
      `Create program code=${dto.code} name=${dto.name}`,
    logSuccessMessage: (result) =>
      `Created program id=${result.id} code=${result.code} name=${result.name}`,
    logErrorMessage: (err, { dto }) =>
      `Create program code=${dto.code} name=${dto.name} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (_, { dto }) =>
      new ConflictException(
        `Program creation failed: code=${dto.code} or name=${dto.name} already exists`,
      ),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Program creation failed due to transaction deadlock',
      ),
  })
  async create(
    @LogParam('dto') createProgramDto: CreateProgramDto,
  ): Promise<ProgramDto> {
    const program = await this.prisma.client.program.create({
      data: createProgramDto,
    });
    return program;
  }

  /**
   * Retrieves all programs matching the provided filters, with pagination support.
   *
   * @async
   * @param {FilterProgramDto} filters - Filter and pagination options (e.g., search keyword, page number).
   * @returns {Promise<PaginatedProgramsDto>} Paginated list of programs with metadata.
   *
   * @throws {BadRequestException} If the query parameters are invalid or fail validation.
   * @throws {NotFoundException} If no programs are found (`P2025`).
   * @throws {ServiceUnavailableException} If database connection fails.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Find programs with filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Found ${result.programs.length} programs`,
    logErrorMessage: (err, { filters }) =>
      `Failed to find programs filters=${JSON.stringify(filters)} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('No programs found'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Finding programs failed due to transaction deadlock',
      ),
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedProgramsDto> {
    const where: Prisma.ProgramWhereInput = {};
    const page = Number(filters?.page) || 1;

    where.deletedAt = null;

    if (filters.search?.trim()) {
      // Clean up the search string
      const searchTerms = filters.search
        .trim() // remove leading/trailing spaces
        .split(/\s+/) // split into words by whitespace (spaces, tabs, etc.)
        .filter(Boolean); // remove any empty strings from the array

      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            name: { contains: term, mode: Prisma.QueryMode.insensitive },
          },
          {
            code: { contains: term, mode: Prisma.QueryMode.insensitive },
          },
        ],
      }));
    }

    const [programs, meta] = await this.prisma.client.program
      .paginate({
        where,
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });

    return { programs, meta };
  }

  /**
   * Retrieves a single program by its unique ID.
   *
   * @async
   * @param {string} id - The UUID of the program.
   * @returns {Promise<ProgramDto>} The program record.
   *
   * @throws {NotFoundException} If no program is found with the given ID (`P2025`).
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id }) => `Find program by id=${id}`,
    logSuccessMessage: (result) =>
      `Found program id=${result.id} code=${result.code}`,
    logErrorMessage: (err, { id }) =>
      `Failed to find program id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Program with id=${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Finding program failed due to transaction deadlock',
      ),
  })
  async findOne(@LogParam('id') id: string): Promise<ProgramDto> {
    const program = await this.prisma.client.program.findUniqueOrThrow({
      where: { id },
    });

    return program;
  }

  /**
   * Updates the details of an existing program.
   *
   * @async
   * @param {string} id - The UUID of the program to update.
   * @param {UpdateProgramDto} updateProgramDto - Data Transfer Object containing updated program details.
   * @returns {Promise<ProgramDto>} The updated program record.
   *
   * @throws {NotFoundException} If no program is found with the given ID (`P2025`).
   * @throws {ConflictException} If the program code or name already exists (`P2002`).
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, dto }) =>
      `Update program id=${id} payload=${JSON.stringify(dto)}`,
    logSuccessMessage: (result) =>
      `Updated program id=${result.id} code=${result.code}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update program id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Program with id=${id} not found`),
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException('Program code or name already exists'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Updating program failed due to transaction deadlock',
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramDto> {
    const program = await this.prisma.client.program.update({
      where: { id },
      data: { ...updateProgramDto },
    });

    return program;
  }

  /**
   * Deletes a program from the database.
   *
   * - If `directDelete` is false (or omitted), the program is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the program is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the program to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<{ message: string }>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no program is found with the given ID (`P2025`).
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Remove program id=${id} directDelete=${directDelete ?? false}`,
    logSuccessMessage: (result, { id }) =>
      `Removed program id=${id}, message="${result.message}"`,
    logErrorMessage: (err, { id, directDelete }) =>
      `Failed to remove program id=${id} directDelete=${directDelete ?? false} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Program with id=${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Deleting program failed due to transaction deadlock',
      ),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const program = await this.prisma.client.program.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !program.deletedAt) {
      await this.prisma.client.program.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: 'Program marked for deletion.' };
    }

    await this.prisma.client.program.delete({
      where: { id },
    });

    return {
      message: 'Program deleted permanently',
    };
  }
}
