import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBillInstallmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  installmentOrder?: number;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  amountToPay?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: Date;
}
