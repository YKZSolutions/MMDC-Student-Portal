import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateBillDtoNoBreakdown extends OmitType(CreateBillDto, [
  'costBreakdown',
]) {}
export class CreateBillingDto {
  @ValidateNested()
  @Type(() => CreateBillDtoNoBreakdown)
  bill: CreateBillDtoNoBreakdown;

  @ValidateNested({ each: true })
  @Type(() => BillingCostBreakdown)
  costBreakdown: BillingCostBreakdown[];

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
