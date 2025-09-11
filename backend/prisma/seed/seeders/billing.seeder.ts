import { PrismaClient, User } from '@prisma/client';

import { log } from '../utils/helpers';
import {
  createBillData,
  createBillInstallmentData,
  createBillPaymentData,
} from '../factories/billing.factory';
import { seedConfig } from '../seed.config';

export async function seedBilling(prisma: PrismaClient, students: User[]) {
  log('Seeding billing...');

  for (const student of students) {
    // Create one bill per student for simplicity
    const bill = await prisma.bill.create({
      data: createBillData(student),
    });

    // Create installments for the bill
    const installments = await Promise.all(
      Array.from({ length: seedConfig.BILL_INSTALLMENTS }, (_, i) =>
        prisma.billInstallment.create({
          data: createBillInstallmentData(bill.id, bill.totalAmount, i),
        }),
      ),
    );

    // Create a payment for the first installment
    if (installments.length > 0) {
      const firstInstallment = installments[0];
      await prisma.billPayment.create({
        data: createBillPaymentData(
          bill.id,
          firstInstallment.id,
          firstInstallment.installmentOrder,
          firstInstallment.amountToPay,
        ),
      });
    }
  }
  log(`-> Created bills for ${students.length} students.`);
}
