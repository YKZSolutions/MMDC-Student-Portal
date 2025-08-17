import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { OmitType } from '@nestjs/swagger';
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
  cost: number;

  @IsString()
  category: string;
}
