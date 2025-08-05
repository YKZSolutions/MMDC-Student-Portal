import { Module } from '@nestjs/common';
import { PaymongoService } from '../paymongo/paymongo.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, PaymongoService],
})
export class WebhookModule {}
