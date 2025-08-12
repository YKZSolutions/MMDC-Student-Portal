import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class CreateBillingDto {
  @ValidateNested()
  @Type(() => CreateBillDto)
  bill: CreateBillDto;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
