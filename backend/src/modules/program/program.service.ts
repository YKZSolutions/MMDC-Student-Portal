import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { MessageDto } from '@/common/dto/message.dto';

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
   * @throws {Error} Any other unexpected errors.
   */

  @Log({
    logArgsMessage: ({ dto }: { dto: CreateProgramDto }) =>
      `Create program code=${dto.programCode} name=${dto.name}`,
    logSuccessMessage: (result) =>
      `Created program id=${result.id} code=${result.programCode} name=${result.name}`,
    logErrorMessage: (err, { dto }: { dto: CreateProgramDto }) =>
      `Create program code=${dto.programCode} name=${dto.name} | Error: ${err.message}`,
  })
  async create(
    @LogParam('dto') createProgramDto: CreateProgramDto,
  ): Promise<ProgramDto> {
    if (createProgramDto.yearDuration && createProgramDto.yearDuration < 0) {
      throw new BadRequestException('Year duration must not be negative');
    }

    return await this.prisma.client.$transaction(async (tx) => {
      await tx.program
        .findFirst({
          where: {
            deletedAt: null,
            OR: [
              { programCode: createProgramDto.programCode },
              { name: createProgramDto.name },
            ],
          },
        })
        .then((program) => {
          if (program) {
            if (program.programCode === createProgramDto.programCode) {
              throw new ConflictException('Program code already exists');
            }

            if (program.name === createProgramDto.name) {
              throw new ConflictException('Program name already exists');
            }
          }
        });

      return this.prisma.client.program.create({
        data: createProgramDto,
      });
    });
  }

  /**
   * Retrieves all programs matching the provided filters, with pagination support.
   *
   * @async
   * @param {BaseFilterDto} filters - Filter and pagination options (e.g., search keyword, page number).
   * @returns {Promise<PaginatedProgramsDto>} Paginated list of programs with metadata.
   *
   * @throws {NotFoundException} If no programs are found (`P2025`).
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Find programs with filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Found ${result.programs.length} programs`,
    logErrorMessage: (err, { filters }) =>
      `Failed to find programs filters=${JSON.stringify(filters)} | Error: ${err.message}`,
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
            programCode: { contains: term, mode: Prisma.QueryMode.insensitive },
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
      `Found program id=${result.id} code=${result.programCode}`,
    logErrorMessage: (err, { id }) =>
      `Failed to find program id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Program with id=${id} not found`),
  })
  async findOne(@LogParam('id') id: string): Promise<ProgramDto> {
    return await this.prisma.client.program.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
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
      `Updated program id=${result.id} code=${result.programCode}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update program id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Program not found`),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('dto') updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramDto> {
    if (updateProgramDto.yearDuration && updateProgramDto.yearDuration < 0) {
      throw new BadRequestException('Year duration must not be negative');
    }

    return await this.prisma.client.$transaction(async (tx) => {
      //Validate for unique program code and name
      await tx.program
        .findFirst({
          where: {
            OR: [
              { programCode: updateProgramDto.programCode },
              { name: updateProgramDto.name },
            ],
            deletedAt: null,
            NOT: { id },
          },
        })
        .then((program) => {
          if (program) {
            if (program.programCode === updateProgramDto.programCode) {
              throw new ConflictException(
                'A program with this program code already exists',
              );
            }
            if (program.name === updateProgramDto.name) {
              throw new ConflictException(
                'A program with this name already exists',
              );
            }
          }
        });

      return tx.program.update({
        where: { id, deletedAt: null },
        data: { ...updateProgramDto },
      });
    });
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
  ): Promise<MessageDto> {
    const program = await this.prisma.client.program.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !program.deletedAt) {
      await this.prisma.client.program.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return new MessageDto('Program marked for deletion.');
    }

    await this.prisma.client.program.delete({
      where: { id },
    });

    return new MessageDto('Program deleted permanently');
  }
}
