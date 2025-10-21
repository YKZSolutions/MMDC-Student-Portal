import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreatePricingDto } from '@/generated/nestjs-dto/create-pricing.dto';
import { UpdatePricingDto } from '@/generated/nestjs-dto/update-pricing.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { PricingDto } from '@/generated/nestjs-dto/pricing.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { Prisma } from '@prisma/client';
import PaginatedPricingDto from './dto/paginated-pricing.dto';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class PricingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new pricing entry in the database.
   *
   * @param createPricingDto - The DTO containing pricing data.
   * @returns The created pricing object in DTO format.
   * @throws NotFoundException - If the related record for the pricing was not found.
   */
  @Log({
    logArgsMessage: ({ createPricingDto }) =>
      `Creating pricing entry with data: ${JSON.stringify(createPricingDto)}`,
    logSuccessMessage: (result) =>
      `Successfully created pricing with ID: ${result.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (
      _,
      { createPricingDto }: { createPricingDto: CreatePricingDto },
    ) =>
      new NotFoundException(
        `Pricing name '${createPricingDto.name}' already exists. Please try a different name.`,
      ),
  })
  async create(
    @LogParam('createPricingDto') createPricingDto: CreatePricingDto,
  ): Promise<PricingDto> {
    return this.prisma.client.pricing.create({
      data: {
        ...createPricingDto,
      },
    });
  }

  /**
   * Retrieves a paginated list of pricing entries from the database.
   *
   * @param filters - The different filters, search, sorting, and pagination for the query.
   * @returns A paginated list of all pricing.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching pricing with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Fetched ${result.meta.totalCount} pricing.`,
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedPricingDto> {
    const page: BaseFilterDto['page'] = Number(filters?.page) || 1;
    const where: Prisma.PricingWhereInput = {};

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim();

      where.name = {
        contains: searchTerms,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    const [pricings, meta] = await this.prisma.client.pricing
      .paginate({
        where,
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });

    return {
      pricings,
      meta,
    };
  }

  /**
   * Retrieves a single pricing entry by ID.
   *
   * @param id - The ID of the pricing to retrieve.
   * @returns The pricing data if found.
   * @throws NotFoundException - If the pricing with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching pricing with ID: ${id}`,
    logSuccessMessage: (result) =>
      `Successfully fetched pricing with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to fetch pricing with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Pricing with ID: ${id} was not found.`),
  })
  async findOne(@LogParam('id') id: string): Promise<PricingDto> {
    return this.prisma.client.pricing.findFirstOrThrow({ where: { id } });
  }

  /**
   * Updates a pricing entry by ID.
   *
   * @param id - The ID of the pricing to update.
   * @param updatePricingDto - The DTO containing the updated data for the pricing.
   * @returns The updated pricing object in DTO format.
   * @throws NotFoundException - If the pricing with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating pricing with ID: ${id}`,
    logSuccessMessage: (result) =>
      `Successfully updated pricing with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update pricing with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Pricing with ID: ${id} was not found.`),
  })
  async update(
    @LogParam('id') id: string,
    updatePricingDto: UpdatePricingDto,
  ): Promise<PricingDto> {
    return this.prisma.client.pricing.update({
      where: { id },
      data: updatePricingDto,
    });
  }

  /**
   * Deletes a pricing entry (soft or permanent).
   *
   * This endpoint performs either a soft delete or a permanent deletion of a pricing based on the provided query parameter.
   * - If `directDelete` is true, the pricing is permanently deleted.
   * - If `directDelete` is not provided or false:
   * - If the pricing is not yet softly deleted (`deletedAt` is null), a soft delete is performed.
   * - If the pricing is already softly deleted, a permanent delete is executed.
   *
   * @param id - The ID of the pricing to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the pricing.
   * @returns A message indicating the result.
   * @throws NotFoundException - If the pricing with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing pricing with ID: ${id}. Direct delete: ${directDelete ?? 'false'}`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { id }) =>
      `Failed to remove pricing with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Pricing with ID: ${id} was not found.`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    if (!directDelete) {
      const pricing = await this.prisma.client.pricing.findFirstOrThrow({
        where: { id },
      });
      if (!pricing.deletedAt) {
        await this.prisma.client.pricing.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });

        return {
          message: 'Pricing has been soft deleted',
        };
      }
    }

    await this.prisma.client.pricing.delete({
      where: { id },
    });

    return {
      message: 'Pricing has been permanently deleted',
    };
  }
}
