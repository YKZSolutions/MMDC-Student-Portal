import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingGroupController } from './pricing-group.controller';
import { PricingGroupService } from './pricing-group.service';

@Module({
  controllers: [PricingController, PricingGroupController],
  providers: [PricingService, PricingGroupService],
})
export class PricingModule {}
