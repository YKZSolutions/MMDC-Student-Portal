import { BillType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BillDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    enum: BillType,
    enumName: 'BillType',
  })
  billType: BillType;
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
