import { PaymentScheme, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

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
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  dueAt: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  costBreakdown: PrismaJson.CostBreakdown;
}
