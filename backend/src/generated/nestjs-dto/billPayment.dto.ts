import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BillPaymentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
