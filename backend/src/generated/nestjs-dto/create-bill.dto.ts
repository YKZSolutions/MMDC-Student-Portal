import { BillType, Prisma } from '@prisma/client';
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
    enum: BillType,
    enumName: 'BillType',
  })
  @IsNotEmpty()
  @IsEnum(BillType)
  billType: BillType;
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  issuedAt: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  costBreakdown: PrismaJson.CostBreakdown;
}
