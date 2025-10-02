import { PaginatedDto } from '@/common/dto/paginated.dto';
import { PricingDto } from '@/generated/nestjs-dto/pricing.dto';

export default class PaginatedPricingDto extends PaginatedDto {
  pricings: PricingDto[];
}
