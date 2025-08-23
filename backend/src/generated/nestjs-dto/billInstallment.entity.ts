import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Bill, type Bill as BillAsType } from './bill.entity';
import {
  BillPayment,
  type BillPayment as BillPaymentAsType,
} from './billPayment.entity';

export class BillInstallment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  billId: string;
  @ApiHideProperty()
  bill?: BillAsType;
  @ApiHideProperty()
  billPayments?: BillPaymentAsType[];
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  installmentOrder: number;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  amountToPay: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dueAt: Date;
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
