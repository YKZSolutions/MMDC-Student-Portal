import { PaymentType, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Bill, type Bill as BillAsType } from './bill.entity';
import {
  BillInstallment,
  type BillInstallment as BillInstallmentAsType,
} from './billInstallment.entity';

export class BillPayment {
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
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  installmentId: string | null;
  @ApiHideProperty()
  installment?: BillInstallmentAsType | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  installmentOrder: number;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  amountPaid: Prisma.Decimal;
  @ApiProperty({
    enum: PaymentType,
    enumName: 'PaymentType',
  })
  paymentType: PaymentType;
  @ApiProperty({
    type: 'string',
  })
  notes: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  paymentDate: Date;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  paymongoData: PrismaJson.PayMongoData | null;
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
