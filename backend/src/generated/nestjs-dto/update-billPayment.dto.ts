import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateBillPaymentDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  amountPaid?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentType?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}
