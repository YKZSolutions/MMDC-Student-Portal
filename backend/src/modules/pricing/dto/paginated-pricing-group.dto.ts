import { PaginatedDto } from '@/common/dto/paginated.dto';
import { PricingDto } from '@/generated/nestjs-dto/pricing.dto';
import { PricingGroupDto } from '@/generated/nestjs-dto/pricingGroup.dto';

export class PricingGroupItemDto extends PricingGroupDto {
  prices: PricingDto[];
}

export default class PaginatedPricingGroupDto extends PaginatedDto {
  pricingGroups: PricingGroupItemDto[];
}
