import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateBillInstallmentDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  installmentOrder: number;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  amountToPay: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  dueAt: Date;
}
