import { UpdateMajorDto } from '@/generated/nestjs-dto/update-major.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomPrismaService } from 'nestjs-prisma';
import { PaginatedMajorsDto } from './dto/paginated-major.dto';
import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { isUUID } from 'class-validator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CreateMajorDto } from './dto/create-major.dto';

@Injectable()
export class MajorService {
  private readonly logger = new Logger(MajorService.name);

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new academic major in the database.
   *
   * @async
   * @param {CreateMajorDto} createMajorDto - Data Transfer Object containing major details to create.
   * @returns {Promise<MajorDto>} The created major record.
   *
   * @throws {ConflictException} - If the major name already exists.
   * @throws {Error} Any other unexpected errors.
   */
  async create(createMajorDto: CreateMajorDto): Promise<MajorDto> {
    try {
      const major = await this.prisma.client.major.create({
        data: {
          name: createMajorDto.major.name,
          description: createMajorDto.major.description,
          program: {
            connect: { id: createMajorDto.programId },
          },
        },
      });
      return major;
    } catch (error) {
      this.logger.error(`Error creating major`);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Major name already exits');
      }

      throw error;
    }
  }

  /**
   * Retrives all majors matching the provided filters, with pagination support.
   *
   * @async
   * @param {FilterMajorDto} filters - Filter and pagination options (e.g., search keyword, page number).
   * @returns {Promise<PaginatedMajorsDto>} - Paginated list of programs with metadata.
   *
   * @throws {BadRequestException} If the query paramters are invalid.
   * @throws {NotFoundException} If no prgrams are found.
   * @throws {Error} Any other unexpected erros.
   */
  async findAll(filters: BaseFilterDto): Promise<PaginatedMajorsDto> {
    try {
      const where: Prisma.MajorWhereInput = {};
      const page = filters.page || 1;

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
        .paginate({ where })
        .withPages({ limit: 10, page, includePageCount: true });
      return { majors, meta };
    } catch (error) {
      this.logger.error(
        `Failed to fetch majors with filters: ${JSON.stringify(filters)}`,
      );

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Major not found');
        }
      }

      throw error;
    }
  }

  /**
   * Retrieves a single major by it's unique ID.
   *
   * @async
   * @param {string} id - The UUID of the major.
   * @returns {Promise<ProgramDto>} The major record.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no program is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  async findOne(id: string): Promise<MajorDto> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid major id format: ${id}`);
      }

      const major = await this.prisma.client.major.findUniqueOrThrow({
        where: { id },
      });

      return major;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Major with id '${id}' not found.`);
        }
      }
      throw error;
    }
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
  async update(id: string, updateMajorDto: UpdateMajorDto): Promise<MajorDto> {
    try {
      const major = await this.prisma.client.major.update({
        where: { id },
        data: { ...updateMajorDto },
      });

      return major;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Major with id '${id}' not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Major name already exists.');
        }
      }
      throw error;
    }
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
  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
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
        message: 'Major permamently deleted',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete major with ID "${id}" (directDelete=${directDelete ?? false})`,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2025')
          throw new NotFoundException('Major not found');

      throw error;
    }
  }
}
