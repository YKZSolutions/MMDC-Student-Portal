import { BillType, Prisma } from '@prisma/client';
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
    enum: BillType,
    enumName: 'BillType',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillType)
  billType?: BillType;
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  issuedAt?: Date;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  costBreakdown?: PrismaJson.CostBreakdown;
}
