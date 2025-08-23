import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateBillingDto {
  @ValidateNested()
  @Type(() => CreateBillDto)
  bill: CreateBillDto;

  @ApiProperty({
    type: 'string',
    isArray: true,
    format: 'date-time',
    example: [
      '2025-01-01T00:00:00Z',
      '2025-02-01T12:30:00Z',
      '2025-03-01T12:30:00Z',
    ],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  dueDates: string[];

  @IsOptional()
  @IsUUID()
  userId?: string;
}

type Breakdown = PrismaJson.CostBreakdown[number];

export class BillingCostBreakdown implements Breakdown {
  @IsString()
  name: string;

  @IsDecimal()
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  cost: Prisma.Decimal;

  @IsString()
  category: string;
}
