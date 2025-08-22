import { PaymentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BillPaymentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
