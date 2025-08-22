import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BillInstallmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
