import {
  Bill,
  BillInstallment,
  BillPayment,
  User,
  Prisma,
} from '@prisma/client';

import { log } from '../utils/helpers';
import {
  createBillData,
  createBillInstallmentData,
  createBillPaymentData,
} from '../factories/billing.factory';
import { seedConfig } from '../seed.config';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedBilling(prisma: PrismaTransaction, students: User[]) {
  log('Seeding billing...');

  // 1. Pre-calculate bills data for batch creation
  const billsToCreate: Prisma.BillCreateManyInput[] = [];
  for (const student of students) {
    billsToCreate.push(createBillData(student));
  }

  // Batch create bills
  if (billsToCreate.length > 0) {
    await prisma.bill.createMany({
      data: billsToCreate,
    });
  }

  // Fetch created bills
  const bills = await prisma.bill.findMany({
    where: {
      userId: {
        in: students.map(s => s.id),
      },
    },
    include: {
      user: true,
    },
  });
  log(`-> Created ${bills.length} bills.`);

  // 2. Pre-calculate bill installments data for batch creation
  const installmentsToCreate: Prisma.BillInstallmentCreateManyInput[] = [];
  for (const bill of bills) {
    for (let i = 0; i < seedConfig.BILL_INSTALLMENTS; i++) {
      installmentsToCreate.push(createBillInstallmentData(
        bill.id,
        bill.totalAmount,
        i,
      ));
    }
  }

  // Batch create bill installments
  if (installmentsToCreate.length > 0) {
    await prisma.billInstallment.createMany({
      data: installmentsToCreate,
    });
  }

  // Fetch created installments
  const installments = await prisma.billInstallment.findMany({
    where: {
      billId: {
        in: bills.map(b => b.id),
      },
    },
    include: {
      bill: true,
    },
  });
  log(`-> Created ${installments.length} bill installments.`);

  // 3. Pre-calculate bill payments data for batch creation
  const paymentsToCreate: Prisma.BillPaymentCreateManyInput[] = [];
  for (const bill of bills) {
    // Create a payment for the first installment of each bill
    const firstInstallment = installments.find(
      inst => inst.billId === bill.id && inst.installmentOrder === 1
    );

    if (firstInstallment) {
      paymentsToCreate.push(createBillPaymentData(
        bill.id,
        firstInstallment.id,
        firstInstallment.installmentOrder,
        firstInstallment.amountToPay,
      ));
    }
  }

  // Batch create bill payments
  if (paymentsToCreate.length > 0) {
    await prisma.billPayment.createMany({
      data: paymentsToCreate,
    });
  }

  // Fetch created payments
  const payments = await prisma.billPayment.findMany({
    where: {
      billId: {
        in: bills.map(b => b.id),
      },
    },
    include: {
      bill: true,
      installment: true,
    },
  });
  log(`-> Created ${payments.length} bill payments.`);

  return { bills, installments, payments };
}
