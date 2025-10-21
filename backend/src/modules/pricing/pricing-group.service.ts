import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreatePricingGroupItemDto } from './dto/create-pricing-group.dto';
import { PricingGroupDto } from '@/generated/nestjs-dto/pricingGroup.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Prisma } from '@prisma/client';
import PaginatedPricingGroupDto, {
  PricingGroupItemDto,
} from './dto/paginated-pricing-group.dto';
import { UpdatePricingGroupItemDto } from './dto/update-pricing-group.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class PricingGroupService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new pricing group entry in the database.
   *
   * @param createPricingDto - The DTO containing pricing group data and a list of prices to connect.
   * @returns The created pricing group object in DTO format.
   * @throws NotFoundException - If one of the pricing IDs to be connected does not exist.
   */
  @Log({
    logArgsMessage: ({ createPricingDto }) =>
      `Creating pricing group with data: ${JSON.stringify(createPricingDto)}`,
    logSuccessMessage: (result) =>
      `Successfully created pricing group with ID: ${result.id}`,
    logErrorMessage: (err) =>
      `Failed to create pricing group. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('One or more pricing IDs were not found.'),
    [PrismaErrorCode.UniqueConstraint]: (
      _,
      { createPricingDto }: { createPricingDto: CreatePricingGroupItemDto },
    ) =>
      new NotFoundException(
        `Pricing group name '${createPricingDto.group.name}' already exists. Please try a different name.`,
      ),
  })
  async create(
    @LogParam('createPricingDto') createPricingDto: CreatePricingGroupItemDto,
  ): Promise<PricingGroupDto> {
    return this.prisma.client.pricingGroup.create({
      data: {
        ...createPricingDto.group,
        prices: {
          connect: createPricingDto.pricings.map((price) => ({
            id: price,
          })),
        },
      },
    });
  }

  /**
   * Retrieves a paginated list of pricing groups from the database.
   *
   * @param filters - The different filters, search, sorting, and pagination for the query.
   * @returns A paginated list of all pricing groups.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Fetching pricing groups with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.meta.totalCount} pricing groups.`,
    logErrorMessage: (err) =>
      `Failed to fetch pricing groups. Error: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedPricingGroupDto> {
    const page: BaseFilterDto['page'] = Number(filters?.page) || 1;
    const where: Prisma.PricingGroupWhereInput = {};

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim();

      where.name = {
        contains: searchTerms,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    const [pricingGroups, meta] = await this.prisma.client.pricingGroup
      .paginate({
        where,
        include: {
          prices: true,
        },
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });

    return {
      pricingGroups,
      meta,
    };
  }

  /**
   * Retrieves a single pricing group entry by ID.
   *
   * @param id - The ID of the pricing group to retrieve.
   * @returns The pricing group data if found, including its associated prices.
   * @throws NotFoundException - If the pricing group with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching pricing group with ID: ${id}`,
    logSuccessMessage: (result) =>
      `Successfully fetched pricing group with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to fetch pricing group with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Pricing group with ID: ${id} was not found.`),
  })
  async findOne(@LogParam('id') id: string): Promise<PricingGroupItemDto> {
    return this.prisma.client.pricingGroup.findFirstOrThrow({
      where: { id },
      include: { prices: true },
    });
  }

  /**
   * Updates a pricing group entry by ID.
   *
   * @param id - The ID of the pricing group to update.
   * @param updatePricingDto - The DTO containing the updated data for the pricing group.
   * @returns The updated pricing group object in DTO format.
   * @throws NotFoundException - If the pricing group or one of the pricing IDs to be connected is not found.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating pricing group with ID: ${id}`,
    logSuccessMessage: (result) =>
      `Successfully updated pricing group with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update pricing group with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(
        `Pricing group with ID: ${id} or one of its prices was not found.`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    updatePricingDto: UpdatePricingGroupItemDto,
  ): Promise<PricingGroupItemDto> {
    const { group, pricings } = updatePricingDto;

    return this.prisma.client.pricingGroup.update({
      where: { id },
      data: {
        ...group,
        prices: pricings
          ? {
              set: pricings.map((pricing) => ({ id: pricing })),
            }
          : undefined,
      },
      include: { prices: true },
    });
  }

  /**
   * Deletes a pricing group entry (soft or permanent).
   *
   * This endpoint performs either a **soft delete** or a **permanent deletion** of a pricing group.
   * - If `directDelete` is true, the pricing group is permanently deleted.
   * - If `directDelete` is not provided or false:
   * - If the pricing group has not been soft-deleted yet, it will be soft-deleted by setting the `deletedAt` timestamp.
   * - If the pricing group has already been soft-deleted, it will be permanently deleted.
   *
   * @param id - The ID of the pricing group to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the pricing group.
   * @returns A message indicating the result.
   * @throws NotFoundException - If the pricing group with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing pricing group with ID: ${id}. Direct delete: ${directDelete ?? 'false'}`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { id }) =>
      `Failed to remove pricing group with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Pricing group with ID: ${id} was not found.`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const pricingGroup = this.prisma.client.pricingGroup;

    if (!directDelete) {
      const pricing = await pricingGroup.findFirstOrThrow({
        where: { id },
      });
      if (!pricing.deletedAt) {
        await pricingGroup.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });

        return {
          message: 'Pricing Group has been soft deleted',
        };
      }
    }

    await pricingGroup.delete({
      where: { id },
    });

    return {
      message: 'Pricing Group has been permanently deleted',
    };
  }
}
