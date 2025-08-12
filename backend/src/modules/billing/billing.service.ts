import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
import { Prisma } from '@prisma/client';
import { FilterBillDto } from './dto/filter-bill.dto';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';

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
  async create(
    createBillingDto: CreateBillDto,
    userId?: string,
  ): Promise<BillDto> {
    try {
      const billing = await this.prisma.client.bill.create({
        data: {
          ...createBillingDto,
          userId,
        },
      });

      return billing;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Error creating the bill');
    }
  }

  /**
   * Retrieves all billing entries from the database.
   *
   * @returns An array of all bills.
   */
  async findAll(filters: FilterBillDto): Promise<{
    bills: BillDto[];
    meta: PageNumberPaginationMeta;
  }> {
    try {
      const where: Prisma.BillWhereInput = {};
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
   *
   * @param id - The ID of the bill to retrieve.
   * @returns The billing object if found.
   */
  async findOne(id: string): Promise<BillDto> {
    try {
      const bill = await this.prisma.client.bill.findUnique({
        where: { id },
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
      const bill = await this.prisma.client.bill.findUnique({ where: { id } });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }

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
   * Deletes a billing entry by ID.
   *
   * @param id - The ID of the bill to delete.
   * @returns The deleted billing object.
   */
  async remove(id: string): Promise<BillDto> {
    try {
      const bill = await this.prisma.client.bill.findUnique({ where: { id } });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }

      return await this.prisma.client.bill.delete({ where: { id } });
    } catch (err) {
      this.logger.error(`Remove billing failed for ID ${id}`, err);
      throw err instanceof NotFoundException
        ? err
        : new InternalServerErrorException('Error deleting the bill');
    }
  }
}
