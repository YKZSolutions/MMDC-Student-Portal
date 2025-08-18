import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateBillingDto } from './dto/create-billing.dto';
import { FilterBillDto } from './dto/filter-bill.dto';
import { PaginatedBillsDto } from './dto/paginated-bills.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new billing entry in the database.
   *
   * @param createBillingDto - The DTO containing billing data (amount, due date, etc.)
   * @param userId - (Optional) The ID of the user the bill is associated with.
   * @returns The created billing object in DTO format.
   * @throws InternalServerErrorException - If the database operation fails.
   */
  async create(createBillingDto: CreateBillingDto): Promise<BillDto> {
    try {
      const billing = await this.prisma.client.bill.create({
        data: {
          ...createBillingDto.bill,
          costBreakdown: createBillingDto.costBreakdown,
          userId: createBillingDto.userId,
        },
      });

      return billing;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Error creating the bill');
    }
  }

  /**
   * Retrieves a list of billing entries from the database.
   * The data returned will depend on the user's role.
   *
   * @param filters - The different filters, search, sorting, and pagination for the query
   * @param role - The user's role
   * @param userId - The user's id
   * @returns A paginated list of all bills.
   */
  async findAll(
    filters: FilterBillDto,
    role: Role,
    userId: string,
  ): Promise<PaginatedBillsDto> {
    try {
      const where: Prisma.BillWhereInput = {};

      // Only the user should see their own list of bills
      if (role !== 'admin') where.userId = userId;

      const orderBy: Prisma.BillOrderByWithRelationInput = {};
      const page: FilterBillDto['page'] = filters.page ?? 1;

      if (filters.type) where.billType = filters.type;

      if (filters.status) where.status = filters.status;

      if (filters.search) {
        where.OR = [
          { invoiceId: { contains: filters.search, mode: 'insensitive' } },
          { payerName: { contains: filters.search, mode: 'insensitive' } },
          { payerEmail: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.excludeSoftDeleted) {
        where.deletedAt = null;
      }

      if (filters.sort) {
        orderBy[filters.sort] = filters.sortOrder ?? 'desc';
      } else {
        orderBy.createdAt = filters.sortOrder ?? 'desc';
      }

      const [bills, meta] = await this.prisma.client.bill
        .paginate({
          where,
          orderBy,
        })
        .withPages({
          limit: 10,
          page: page,
          includePageCount: true,
        });

      return { bills, meta };
    } catch (err) {
      this.logger.error('Find all billings failed', err);
      throw new InternalServerErrorException('Error retrieving bills');
    }
  }

  /**
   * Retrieves a single billing entry by ID.
   * If the user's role is not an admin, they can only retrieve their own bill.
   *
   * @param id - The ID of the bill to retrieve.
   * @param role - The user's role
   * @param userId - The user's id
   * @returns The billing object if found.
   * @throws NotFoundException - If there are no bill with the specified id
   */
  async findOne(id: string, role: Role, userId: string): Promise<BillDto> {
    try {
      const bill = await this.prisma.client.bill.findUnique({
        where: {
          id,
          ...(role !== 'admin' ? { userId } : undefined),
        },
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }

      return bill;
    } catch (err) {
      this.logger.error(`Find one billing failed for ID ${id}`, err);
      throw err instanceof NotFoundException
        ? err
        : new InternalServerErrorException('Error retrieving the bill');
    }
  }

  /**
   * Updates a billing entry by ID.
   *
   * @param id - The ID of the bill to update.
   * @param updateBillingDto - The DTO with updated bill data.
   * @returns The updated billing object.
   */
  async update(id: string, updateBillingDto: UpdateBillDto): Promise<BillDto> {
    try {
      return await this.prisma.client.bill.update({
        where: { id },
        data: updateBillingDto,
      });
    } catch (err) {
      this.logger.error(`Update billing failed for ID ${id}`, err);
      throw err instanceof NotFoundException
        ? err
        : new InternalServerErrorException('Error updating the bill');
    }
  }

  /**
   * Deletes a bill (temporary o permanent)
   *
   * - If `directDelete` is true, the bill is permanently deleted without checking `deletedAt`.
   * - If `directDelete` is false or undefined:
   *   - If `deletedAt` is null, it sets the current date to softly delete the bill.
   *   - If `deletedAt` is already set, the bill is permanently deleted.
   *
   * @param id - The ID of the bill to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the bill.
   * @returns A message indicating the result.
   */
  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
      if (!directDelete) {
        const payment = await this.prisma.client.bill.findFirstOrThrow({
          where: { id: id },
        });
        if (!payment.deletedAt) {
          await this.prisma.client.bill.update({
            where: { id: id },
            data: {
              deletedAt: new Date(),
            },
          });

          return {
            message: 'Bill has been soft deleted',
          };
        }
      }

      await this.prisma.client.bill.delete({
        where: { id: id },
      });

      return {
        message: 'Bill has been permanently deleted',
      };
    } catch (err) {
      this.logger.error(`Remove billing failed for ID ${id}`, err);
      throw err instanceof NotFoundException
        ? err
        : new InternalServerErrorException('Error deleting the bill');
    }
  }
}
