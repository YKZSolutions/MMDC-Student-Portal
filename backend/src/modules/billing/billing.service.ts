import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BillType, PaymentScheme, Prisma, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  getBillingWithPayment,
  getBillingWithPaymentMeta,
} from '@prisma/client/sql';
import { CustomPrismaService } from 'nestjs-prisma';
import { InstallmentService } from '../installment/installment.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { DetailedBillDto } from './dto/detailed-bill.dto';
import { BillStatus, FilterBillDto } from './dto/filter-bill.dto';
import { PaginatedBillsDto } from './dto/paginated-bills.dto';

@Injectable()
export class BillingService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly installmentService: InstallmentService,
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
    createBillingDto: CreateBillingDto['bill'],
    dueDates: string[],
    @LogParam('userId') userId?: string,
  ): Promise<BillDto> {
    const transaction = this.prisma.client.$transaction(async (tx) => {
      const billing = await tx.bill.create({
        data: {
          ...createBillingDto,
          userId,
        },
      });

      await this.installmentService.create(
        {
          billId: billing.id,
          paymentScheme: createBillingDto.paymentScheme,
          totalAmount: createBillingDto.totalAmount,
          dueDates: dueDates,
        },
        tx,
      );

      return billing;
    });

    return transaction;
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
    logArgsMessage: ({ filter }) =>
      `Fetching bills for filter=${JSON.stringify(filter)}`,
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

    const scheme = filters.scheme ? PaymentScheme[filters.scheme] : null;
    const billType = filters.type ? BillType[filters.type] : null;
    const status = filters.status || null;
    const search = filters.search || null;
    const sort = filters.sort || null;
    const sortDir = filters.sortOrder || 'desc';
    const isDeleted = filters.isDeleted || false;

    const fetchedBills = await this.prisma.client.$queryRawTyped(
      getBillingWithPayment(
        limit,
        offset,
        scheme,
        billType,
        status,
        search,
        user,
        sort,
        sortDir,
        isDeleted,
      ),
    );

    const bills = fetchedBills.map((bill) => {
      return {
        ...bill,
        status: bill.status ? BillStatus[bill.status] : BillStatus.unpaid,
        totalPaid: bill.totalPaid || Prisma.Decimal(0),
        totalInstallments: Number(bill.totalInstallments) || 1,
        paidInstallments: Number(bill.paidInstallments) || 0,
        installmentDueDates: bill.installmentDueDates || [],
      };
    });

    const totalResult = await this.prisma.client.$queryRawTyped(
      getBillingWithPaymentMeta(
        scheme,
        billType,
        status,
        search,
        user,
        isDeleted,
      ),
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
    const bill = await this.prisma.client.bill.findFirstOrThrow({
      where: {
        id,
        ...(role !== 'admin' && { userId }),
      },
    });

    const billPayments = await this.prisma.client.billPayment.aggregate({
      where: { billId: bill?.id },
      _sum: {
        amountPaid: true,
      },
    });

    const billInstallments = await this.installmentService.findAll(
      bill.id,
      role,
      userId,
    );

    const totalInstallments = billInstallments.length || 1;

    const paidInstallments = billInstallments.filter(
      (installment) => installment.status === 'paid',
    ).length;

    const installmentDueDates = billInstallments.map(
      (installment) => installment.dueAt,
    );

    const totalPaid = billPayments._sum.amountPaid || Decimal(0);

    const status: BillStatus = (() => {
      switch (true) {
        case totalPaid.eq(0):
          return BillStatus.unpaid;
        case totalPaid.lessThan(bill.totalAmount):
          return BillStatus.partial;
        case totalPaid.eq(bill.totalAmount):
          return BillStatus.paid;
        case totalPaid.greaterThan(bill.totalAmount):
          return BillStatus.overpaid;
        default:
          return BillStatus.unpaid;
      }
    })();

    return {
      ...bill,
      totalPaid,
      status,
      installmentDueDates,
      totalInstallments,
      paidInstallments,
      billInstallments,
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
    logArgsMessage: ({ id, directDelete }) =>
      `Removing bill with id=${id}, directDelete=${directDelete}`,
    logSuccessMessage: (res) => res.message,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Bill with id=${id} was not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    if (!directDelete) {
      const payment = await this.prisma.client.bill.findFirstOrThrow({
        where: { id: id },
      });
      if (!payment.deletedAt) {
        this.prisma.client.$transaction(async (tx) => {
          await tx.billPayment.updateMany({
            where: { billId: id },
            data: {
              deletedAt: new Date(),
            },
          });

          await tx.billInstallment.updateMany({
            where: { billId: id },
            data: {
              deletedAt: new Date(),
            },
          });

          await tx.bill.updateMany({
            where: { id: id },
            data: {
              deletedAt: new Date(),
            },
          });
        });

        return {
          message: 'Bill has been soft deleted',
        };
      }
    }

    this.prisma.client.$transaction(async (tx) => {
      await tx.billPayment.deleteMany({
        where: { billId: id },
      });

      await tx.billInstallment.deleteMany({
        where: { billId: id },
      });

      await tx.bill.delete({
        where: { id: id },
      });
    });

    return {
      message: 'Bill has been permanently deleted',
    };
  }
}
