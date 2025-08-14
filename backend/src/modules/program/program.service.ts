import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { ProgramDto } from '@/generated/nestjs-dto/program.dto';
import { PaginatedProgramsDto } from './dto/paginated-program.dto';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { CreateProgramDto } from '@/generated/nestjs-dto/create-program.dto';
import { UpdateProgramDto } from '@/generated/nestjs-dto/update-program.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

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

  async create(createProgramDto: CreateProgramDto): Promise<ProgramDto> {
    try {
      const program = await this.prisma.client.program.create({
        data: createProgramDto,
      });
      return program;
    } catch (error) {
      this.logger.error(
        `Failed to create program with code ${createProgramDto.code} and name ${createProgramDto.name}.`,
      );
      // Handle service specific expcetions
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Program code or name already exists.');
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new ServiceUnavailableException('Database connection failed');
      }
      // Let http exception filter handle unknown expcetion
      throw error;
    }
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
  async findAll(filters: BaseFilterDto): Promise<PaginatedProgramsDto> {
    try {
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
    } catch (error) {
      this.logger.error(
        `Failed to fetch programs with filters: ${JSON.stringify(filters)}`,
      );

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Program not found');
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new ServiceUnavailableException('Database connection failed');
      }
      throw error;
    }
  }

  /**
   * Retrieves a single program by its unique ID.
   *
   * @async
   * @param {string} id - The UUID of the program.
   * @returns {Promise<ProgramDto>} The program record.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no program is found with the given ID (`P2025`).
   * @throws {Error} Any other unexpected errors.
   */
  async findOne(id: string): Promise<ProgramDto> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid program ID format: ${id}`);
      }

      const program = await this.prisma.client.program.findUniqueOrThrow({
        where: { id },
      });

      return program;
    } catch (error) {
      this.logger.error(`Failed to fetch program with id: ${id}`);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Program with id '${id}' not found.`);
        }
      }
      throw error;
    }
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
  async update(
    id: string,
    updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramDto> {
    try {
      const program = await this.prisma.client.program.update({
        where: { id },
        data: { ...updateProgramDto },
      });

      return program;
    } catch (error) {
      this.logger.error(
        `Failed to update program with id ${id} using payload: ${JSON.stringify(updateProgramDto)}`,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Program with id '${id}' not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Program code or name already exists.');
        }
      }

      throw error;
    }
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
  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
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
    } catch (error) {
      this.logger.error(
        `Failed to delete program with ID "${id}" (directDelete=${directDelete ?? false})`,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2025')
          throw new NotFoundException('Program not found');

      throw error;
    }
  }
}
