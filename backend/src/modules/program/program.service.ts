import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CustomPrismaService } from 'nestjs-prisma';
import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
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
    return await this.prisma.client.$transaction(async (tx) => {
      // Validate data
      await this.validateMutationData(createProgramDto, tx);

      // If no conflict, create the new program
      return tx.program.create({
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
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Program not found`),
  })
  async findOne(@LogParam('id') id: string): Promise<ProgramDto> {
    return await this.prisma.client.program.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Updates the details of an existing program.
   *
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
    return await this.prisma.client.$transaction(async (tx) => {
      // Validate data
      await this.validateMutationData(updateProgramDto, tx, id);

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
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Program not found`),
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

  async validateMutationData(
    programToCheck: UpdateProgramDto | CreateProgramDto,
    transactionClient: PrismaTransaction,
    id?: string,
  ) {
    if (programToCheck.yearDuration && programToCheck.yearDuration < 0) {
      throw new BadRequestException('Year duration must not be negative');
    }

    const excludeId = { NOT: { id } };

    // 1. Check for Program Code Conflict (if code is provided)
    if (programToCheck.programCode) {
      const existingCodeProgram = await transactionClient.program.findFirst({
        where: {
          deletedAt: null,
          ...excludeId,
          programCode: {
            equals: programToCheck.programCode,
            mode: Prisma.QueryMode.insensitive, // Case-insensitive search
          },
        },
      });

      if (existingCodeProgram) {
        throw new ConflictException(
          `Program code '${existingCodeProgram.programCode}' already exists`,
        );
      }
    }

    // 2. Check for Name Conflict (if a name is provided)
    if (programToCheck.name) {
      const existingNameProgram = await transactionClient.program.findFirst({
        where: {
          deletedAt: null,
          ...excludeId,
          name: {
            equals: programToCheck.name,
            mode: Prisma.QueryMode.insensitive, // Case-insensitive search
          },
        },
      });

      if (existingNameProgram) {
        throw new ConflictException(
          `Program name '${existingNameProgram.name}' already exists`,
        );
      }
    }

    // If neither check throws an error, the data is valid.
  }
}
