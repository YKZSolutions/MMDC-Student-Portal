import { PaymentScheme, Prisma } from '@prisma/client';

export class CreateInstallmentDto {
  billId: string;
  paymentScheme: PaymentScheme;
  totalAmount: Prisma.Decimal;
  dueDates: Date[];
}
