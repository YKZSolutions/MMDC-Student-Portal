import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  imports: [PaymentsModule],
})
export class BillingModule {}
