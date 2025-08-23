import { BillType, PaymentScheme, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBillDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  payerName?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  payerEmail?: string;
  @ApiProperty({
    enum: BillType,
    enumName: 'BillType',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillType)
  billType?: BillType;
  @ApiProperty({
    enum: PaymentScheme,
    enumName: 'PaymentScheme',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentScheme)
  paymentScheme?: PaymentScheme;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  totalAmount?: Prisma.Decimal;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  costBreakdown?: PrismaJson.CostBreakdown;
}
