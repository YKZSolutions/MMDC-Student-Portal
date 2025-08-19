import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
import { BillType, Prisma, Role } from '@prisma/client';
import { BillStatus, FilterBillDto } from './dto/filter-bill.dto';
import { PaginatedBillsDto } from './dto/paginated-bills.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  getBillingWithPayment,
  getBillingWithPaymentMeta,
} from '@prisma/client/sql';
import { DetailedBillDto } from './dto/detailed-bill.dto';

@Injectable()
export class BillingService {
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
   * @throws NotFoundException - If the user with the id was not found
   */
  @Log({
    logArgsMessage: ({ userId }) => `Creating bill for user=${userId}`,
    logSuccessMessage: (_, { userId }) => `Created bill for user ${userId}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`User with id=${userId} was not found`),
  })
  async create(
    createBillingDto: CreateBillDto,
    @LogParam('userId') userId?: string,
  ): Promise<BillDto> {
    const billing = await this.prisma.client.bill.create({
      data: {
        ...createBillingDto,
        userId,
      },
    });

    return billing;
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
  @Log({
    logArgsMessage: ({ filter }) => `Fetching bills for page=${filter.page}`,
    logSuccessMessage: (res) => `Fetched bills with ${res.meta.totalCount}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`User with id=${userId} was not found`),
  })
  async findAll(
    @LogParam('filter') filters: FilterBillDto,
    role: Role,
    @LogParam('userId') userId: string,
  ): Promise<PaginatedBillsDto> {
    const user = role !== 'admin' ? userId : null;

    const page: FilterBillDto['page'] = filters.page ?? 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const type = filters.type ? BillType[filters.type] : null;
    const status = filters.status || null;
    const search = filters.search || null;
    const sort = filters.sort || null;
    const sortDir = filters.sortOrder || 'desc';

    const fetchedBills = await this.prisma.client.$queryRawTyped(
      getBillingWithPayment(
        limit,
        offset,
        type,
        status,
        search,
        user,
        sort,
        sortDir,
      ),
    );

    const bills = fetchedBills.map((bill) => {
      return {
        ...bill,
        status: bill.status ? BillStatus[bill.status] : BillStatus.unpaid,
        totalPaid: bill.totalPaid || Prisma.Decimal(0),
      };
    });

    const totalResult = await this.prisma.client.$queryRawTyped(
      getBillingWithPaymentMeta(type, status, search, user),
    );

    const totalCount = Number(totalResult[0]?.count ?? 0);
    const pageCount = Math.ceil(totalCount / limit);

    const meta = {
      isFirstPage: page === 1,
      isLastPage: page >= pageCount,
      currentPage: page,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < pageCount ? page + 1 : null,
      pageCount,
      totalCount,
    };

    return { bills, meta };
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
  @Log({
    logArgsMessage: ({ id }) => `Fetching bills for id=${id}`,
    logSuccessMessage: (res) => `Fetched bills with id=${res.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Bill with id=${id} was not found`),
  })
  async findOne(
    @LogParam('id') id: string,
    role: Role,
    userId: string,
  ): Promise<DetailedBillDto> {
    const bill = await this.prisma.client.bill.findUnique({
      where: {
        id,
        ...(role !== 'admin' && {
          bill: {
            userId,
          },
        }),
      },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with id=${id} not found`);
    }

    const billPayments = await this.prisma.client.billPayment.aggregate({
      where: { billId: bill?.id },
      _sum: {
        amountPaid: true,
      },
    });

    const totalPaid = billPayments._sum.amountPaid;

    if (!totalPaid) {
      throw new NotFoundException(
        `Bill payments of bill with id=${id} not found`,
      );
    }

    const status: BillStatus = (() => {
      switch (true) {
        case totalPaid.eq(0):
          return BillStatus.unpaid;
        case totalPaid.lessThan(bill.amountToPay):
          return BillStatus.partial;
        case totalPaid.eq(bill.amountToPay):
          return BillStatus.paid;
        case totalPaid.greaterThan(bill.amountToPay):
          return BillStatus.overpaid;
        default:
          return BillStatus.unpaid;
      }
    })();

    return {
      ...bill,
      totalPaid,
      status,
    };
  }

  /**
   * Updates a billing entry by ID.
   *
   * @param id - The ID of the bill to update.
   * @param updateBillingDto - The DTO with updated bill data.
   * @returns The updated billing object.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating bill with id=${id}`,
    logSuccessMessage: (res) => `Updated the bill with id=${res.id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Bill with id=${id} was not found`),
  })
  async update(
    @LogParam('id') id: string,
    updateBillingDto: UpdateBillDto,
  ): Promise<BillDto> {
    return await this.prisma.client.bill.update({
      where: { id },
      data: updateBillingDto,
    });
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
  @Log({
    logArgsMessage: ({ id }) => `Removing bill with id=${id}`,
    logSuccessMessage: (res) => res.message,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Bill with id=${id} was not found`),
  })
  async remove(
    @LogParam('id') id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
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

        await this.prisma.client.billPayment.updateMany({
          where: { billId: id },
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

    await this.prisma.client.billPayment.deleteMany({
      where: { billId: id },
    });

    return {
      message: 'Bill has been permanently deleted',
    };
  }
}
