import { PaymentScheme, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  BillInstallment,
  type BillInstallment as BillInstallmentAsType,
} from './billInstallment.entity';
import {
  BillPayment,
  type BillPayment as BillPaymentAsType,
} from './billPayment.entity';

export class Bill {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userId: string | null;
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: UserAsType | null;
  @ApiHideProperty()
  billInstallments?: BillInstallmentAsType[];
  @ApiHideProperty()
  billPayments?: BillPaymentAsType[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  invoiceId: number;
  @ApiProperty({
    type: 'string',
  })
  payerName: string;
  @ApiProperty({
    type: 'string',
  })
  payerEmail: string;
  @ApiProperty({
    enum: PaymentScheme,
    enumName: 'PaymentScheme',
  })
  paymentScheme: PaymentScheme;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dueAt: Date;
  @ApiProperty({
    type: () => Object,
  })
  costBreakdown: PrismaJson.CostBreakdown;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
