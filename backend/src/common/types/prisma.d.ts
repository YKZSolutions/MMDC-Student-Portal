import { PayMongoWebhookEvent } from '@/modules/payments/types/paymongo-types';

declare global {
  namespace PrismaJson {
    type CostBreakdown = {
      category: string;
      name: string;
      cost: number;
    }[];

    type PayMongoData = PayMongoWebhookEvent;
  }
}

export {};
