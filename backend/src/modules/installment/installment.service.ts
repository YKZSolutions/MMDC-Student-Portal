import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { PaymentScheme, Prisma, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { BillStatus } from '../billing/dto/filter-bill.dto';
import { BillInstallmentItemDto } from './dto/list-installment.dto';

@Injectable()
export class InstallmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ dto }) => `Creating installments for bill=${dto.billId}`,
    logSuccessMessage: (res, { dto }) =>
      `Created ${res} installments for bill ${dto.billId}`,
  })
  @PrismaError({})
  async create(
    @LogParam('dto') createInstallmentDto: CreateInstallmentDto,
    tx?: PrismaTransaction,
  ) {
    const installmentType: Record<
      PaymentScheme,
      { name: string[]; percentage: number[] }
    > = {
      full: {
        name: ['Full Payment'],
        percentage: [1],
      },
      installment1: {
        name: ['Down Payment', 'First Installment', 'Second Installment'],
        percentage: [0.2, 0.4, 0.4],
      },
      installment2: {
        name: ['Down Payment', 'First Installment', 'Second Installment'],
        percentage: [0.4, 0.3, 0.3],
      },
    };

    const data: Prisma.BillInstallmentCreateManyInput[] = installmentType[
      createInstallmentDto.paymentScheme
    ].percentage.map((percent, idx) => ({
      billId: createInstallmentDto.billId,
      name: installmentType[createInstallmentDto.paymentScheme].name[idx],
      installmentOrder: idx,
      amountToPay: new Decimal(createInstallmentDto.totalAmount).mul(percent),
      dueAt: createInstallmentDto.dueDates[idx],
    }));

    const installments = await (
      tx || this.prisma.client
    ).billInstallment.createMany({
      data,
    });

    return installments.count;
  }

  /**
   * Retrieves a list of installment entries from the database.
   * The data returned will depend on the user's role.
   *
   * @param billId - An ID reference of the bill
   * @param role - The user's role
   * @param userId - The user's ID
   * @returns An paginated list of all installments.
   * @throws NotFoundException - If the installments with specified billId was not found
   */
  @Log({
    logArgsMessage: ({ billId }) => `Fetching installments for bill=${billId}`,
    logSuccessMessage: (_, { billId }) =>
      `Fetched installments for bill ${billId}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { billId }) =>
      new NotFoundException(
        `Installments with billId=${billId} were not found`,
      ),
  })
  async findAll(
    @LogParam('billId') billId: string,
    role: Role,
    userId: string,
  ): Promise<BillInstallmentItemDto[]> {
    const installments = await this.prisma.client.billInstallment.findMany({
      where: {
        billId,
        ...(role !== 'admin' && {
          bill: {
            userId,
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        billPayments: {
          select: {
            amountPaid: true,
          },
        },
      },
    });

    return installments.map((installment) => {
      const totalPaid = installment.billPayments.reduce(
        (acc, p) => acc.add(p.amountPaid),
        Decimal(0),
      );

      const status: BillStatus = (() => {
        switch (true) {
          case totalPaid.eq(0):
            return BillStatus.unpaid;
          case totalPaid.lessThan(installment.amountToPay):
            return BillStatus.partial;
          case totalPaid.eq(installment.amountToPay):
            return BillStatus.paid;
          case totalPaid.greaterThan(installment.amountToPay):
            return BillStatus.overpaid;
          default:
            return BillStatus.unpaid;
        }
      })();

      const { billPayments, ...installmentPayload } = installment;

      return {
        ...installmentPayload,
        totalPaid,
        status,
      };
    });
  }

  /**
   * Retrieves a single installment entry by ID.
   * If the user's role is not an admin, they can only retrieve their own installment.
   *
   * @param id - The ID of the installment to retrieve.
   * @param role - The user's role
   * @param userId - The user's id
   * @returns The installment object if found.
   * @throws NotFoundException - If there are no installment with the specified id
   */
  @Log({
    logArgsMessage: ({ id }) => `Fetching installment with id=${id}`,
    logSuccessMessage: (_, { id }) => `Fetched installment with id ${id}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Installment id=${id} was not found`),
  })
  async findOne(
    @LogParam('id') id: string,
    role: Role,
    userId: string,
  ): Promise<BillInstallmentItemDto> {
    const installment =
      await this.prisma.client.billInstallment.findFirstOrThrow({
        where: {
          id,
          ...(role !== 'admin' && {
            bill: {
              userId,
            },
          }),
        },
        include: {
          billPayments: {
            select: {
              amountPaid: true,
            },
          },
        },
      });

    const totalPaid = installment.billPayments.reduce(
      (acc, p) => acc.add(p.amountPaid),
      Decimal(0),
    );

    const status: BillStatus = (() => {
      switch (true) {
        case totalPaid.eq(0):
          return BillStatus.unpaid;
        case totalPaid.lessThan(installment.amountToPay):
          return BillStatus.partial;
        case totalPaid.eq(installment.amountToPay):
          return BillStatus.paid;
        case totalPaid.greaterThan(installment.amountToPay):
          return BillStatus.overpaid;
        default:
          return BillStatus.unpaid;
      }
    })();

    const { billPayments, ...installmentPayload } = installment;

    return {
      ...installmentPayload,
      totalPaid,
      status,
    };
  }

  update(id: number, updateInstallmentDto: UpdateInstallmentDto) {
    return `This action updates a #${id} installment`;
  }

  remove(id: number) {
    return `This action removes a #${id} installment`;
  }
}
