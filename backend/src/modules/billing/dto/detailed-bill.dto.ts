import { BillDto as AutoBillDto } from '@/generated/nestjs-dto/bill.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterBillDto } from './filter-bill.dto';

export class DetailedBillDto extends AutoBillDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalPaid: Prisma.Decimal;

  status: FilterBillDto['status'];
}
