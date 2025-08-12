import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Bill, type Bill as BillAsType } from './bill.entity';

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
  bill: BillAsType;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  amountPaid: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  paymentType: string;
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
