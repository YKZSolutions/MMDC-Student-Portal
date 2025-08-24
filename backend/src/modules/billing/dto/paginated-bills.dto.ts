import { PaginatedDto } from '@/common/dto/paginated.dto';
import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterBillDto } from './filter-bill.dto';

export class BillItemDto extends OmitType(BillDto, ['costBreakdown']) {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalPaid: Prisma.Decimal;

  status: FilterBillDto['status'];

  totalInstallments: number;
  paidInstallments: number;
  installmentDueDates: Date[];
}

export class PaginatedBillsDto extends PaginatedDto {
  bills: BillItemDto[];
}
