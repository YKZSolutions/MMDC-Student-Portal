import { PayMongoWebhookEvent } from '@/modules/payments/types/paymongo-types';
import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaJson {
    type CostBreakdown = {
      category: string;
      name: string;
      cost: Prisma.Decimal;
    }[];

    type PayMongoData = PayMongoWebhookEvent | null;
  }
}

export { };

