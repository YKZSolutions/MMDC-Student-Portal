import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PaymentsModule } from '../payments/payments.module';
import { InstallmentModule } from '../installment/installment.module';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  imports: [InstallmentModule, PaymentsModule],
  exports: [BillingService],
})
export class BillingModule {}
