import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { Type } from 'class-transformer';
import {
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
