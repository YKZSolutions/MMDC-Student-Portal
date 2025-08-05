import { BillingDetailsPaymongoDto } from './billing-details-paymongo.dto';
import { CardDetailsPaymongoDto } from './card-details-paymongo.dto';

export class CreateMethodPaymongoDto {
  billing?: BillingDetailsPaymongoDto;
  details?: CardDetailsPaymongoDto;
  type: 'gcash' | 'paymaya';
  amount: number;
}
