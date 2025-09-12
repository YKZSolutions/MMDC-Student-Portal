import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { BillingCostBreakdown } from './create-billing.dto';
import { FilterBillDto } from './filter-bill.dto';

export class DetailedBillDto extends OmitType(BillDto, ['costBreakdown']) {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalPaid: Prisma.Decimal;

  status: FilterBillDto['status'];

  costBreakdown: BillingCostBreakdown[];
}
