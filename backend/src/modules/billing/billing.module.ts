import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PaymentsModule } from '../payments/payments.module';
import { InstallmentModule } from '../installment/installment.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  imports: [InstallmentModule, PaymentsModule, NotificationsModule],
  exports: [BillingService],
})
export class BillingModule {}
