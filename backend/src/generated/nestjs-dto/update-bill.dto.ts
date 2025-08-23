import { PaymentScheme, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

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
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: Date;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  costBreakdown?: PrismaJson.CostBreakdown;
}
