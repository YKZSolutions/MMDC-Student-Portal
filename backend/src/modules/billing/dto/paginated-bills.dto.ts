import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';

export class PaginatedBillsDto {
  bills: BillDto[];
  meta: PageNumberPaginationMeta;
}
