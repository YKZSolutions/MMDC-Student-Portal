import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterBillDto } from './filter-bill.dto';

export class DetailedBillDto extends BillDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalPaid: Prisma.Decimal;

  status: FilterBillDto['status'];
}
