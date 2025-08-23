import { BillingCostBreakdown } from './create-billing.dto';
import { BillItemDto } from './paginated-bills.dto';

export class DetailedBillDto extends BillItemDto {
  costBreakdown: BillingCostBreakdown[];
}
