import { PaginatedDto } from '@/common/dto/paginated.dto';
import { OmitType } from '@nestjs/swagger';
import { DetailedBillDto } from './detailed-bill.dto';

// Replace this name with a more appropriate one
class SingleBillDto extends OmitType(DetailedBillDto, ['costBreakdown']) {}

export class PaginatedBillsDto extends PaginatedDto {
  bills: SingleBillDto[];
}
