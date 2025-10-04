import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { PricingGroupDto } from '@/generated/nestjs-dto/pricingGroup.dto';

export class EnrollmentPeriodItemDto extends EnrollmentPeriodDto {
  pricingGroup?: PricingGroupDto;
}
