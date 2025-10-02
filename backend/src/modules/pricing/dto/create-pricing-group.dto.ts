import { CreatePricingGroupDto } from '@/generated/nestjs-dto/create-pricingGroup.dto';
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class CreatePricingGroupItemDto {
  @ValidateNested()
  @Type(() => CreatePricingGroupDto)
  group: CreatePricingGroupDto;

  @IsArray()
  @IsUUID('4', { each: true })
  pricings: string[];
}
