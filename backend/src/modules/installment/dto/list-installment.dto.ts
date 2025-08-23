import { BillInstallmentDto } from '@/generated/nestjs-dto/billInstallment.dto';
import { BillStatus } from '@/modules/billing/dto/filter-bill.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class BillInstallmentItemDto extends BillInstallmentDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalPaid: Prisma.Decimal;
  status: BillStatus;
}
