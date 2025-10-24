// prisma/seed/factories/billing.factory.ts
import { faker } from '@faker-js/faker';
import {
  BillType,
  PaymentScheme,
  PaymentType,
  Prisma,
  User,
} from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';
import { seedConfig } from '../seed.config';

export function createBillData(student: User): Prisma.BillCreateManyInput {
  const totalAmount = faker.number.int({ min: 15000, max: 40000 });
  return {
    userId: student.id,
    payerName: `${student.firstName} ${student.lastName}`,
    payerEmail: faker.internet.email(),
    billType: pickRandomEnum(BillType),
    paymentScheme: pickRandomEnum(PaymentScheme),
    totalAmount: new Prisma.Decimal(totalAmount),
    costBreakdown: [
      {
        category: 'tuition',
        name: 'Tuition Fee',
        cost: new Prisma.Decimal(totalAmount * 0.8),
      },
      {
        category: 'miscellaneous',
        name: 'Miscellaneous Fees',
        cost: new Prisma.Decimal(totalAmount * 0.2),
      },
    ],
  };
}

export function createBillInstallmentData(
  billId: string,
  totalAmount: Prisma.Decimal,
  index: number,
): Prisma.BillInstallmentCreateManyInput {
  const amountToPay = totalAmount.toNumber() / seedConfig.BILL_INSTALLMENTS;
  return {
    billId,
    name: `Installment ${index + 1}`,
    installmentOrder: index + 1,
    amountToPay: new Prisma.Decimal(amountToPay),
    dueAt: faker.date.future(),
  };
}

export function createBillPaymentData(
  billId: string,
  installmentId: string,
  installmentOrder: number,
  amountPaid: Prisma.Decimal,
): Prisma.BillPaymentCreateManyInput {
  return {
    billId,
    installmentId,
    installmentOrder,
    amountPaid,
    paymentType: pickRandomEnum(PaymentType),
    notes: `Paid via ${pickRandomEnum(PaymentType)}`,
    paymentDate: faker.date.recent(),
  };
}
