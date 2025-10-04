import { UpdatePricingGroupDto } from '@/generated/nestjs-dto/update-pricingGroup.dto';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class UpdatePricingGroupItemDto {
  @ValidateNested()
  @Type(() => UpdatePricingGroupDto)
  group: UpdatePricingGroupDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  pricings?: string[];
}
