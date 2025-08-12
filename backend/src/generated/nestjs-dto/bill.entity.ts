import { BillStatus, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
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
  billPayments?: BillPaymentAsType[];
  @ApiProperty({
    type: 'string',
  })
  invoiceId: string;
  @ApiProperty({
    type: 'string',
  })
  payerName: string;
  @ApiProperty({
    type: 'string',
  })
  payerEmail: string;
  @ApiProperty({
    type: 'string',
  })
  billType: string;
  @ApiProperty({
    enum: BillStatus,
    enumName: 'BillStatus',
  })
  status: BillStatus;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  receivableAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  receiptedAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  outstandingAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dueAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  issuedAt: Date;
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
