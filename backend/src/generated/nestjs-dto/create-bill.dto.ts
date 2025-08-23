import { BillType, PaymentScheme, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  payerName: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  payerEmail: string;
  @ApiProperty({
    enum: BillType,
    enumName: 'BillType',
  })
  @IsNotEmpty()
  @IsEnum(BillType)
  billType: BillType;
  @ApiProperty({
    enum: PaymentScheme,
    enumName: 'PaymentScheme',
  })
  @IsNotEmpty()
  @IsEnum(PaymentScheme)
  paymentScheme: PaymentScheme;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  totalAmount: Prisma.Decimal;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  costBreakdown: PrismaJson.CostBreakdown;
}
