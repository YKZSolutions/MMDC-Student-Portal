import { PaginatedDto } from '@/common/dto/paginated.dto';
import { MajorItemDto } from './major-item.dto';

export class PaginatedMajorsDto extends PaginatedDto {
  majors: MajorItemDto[];
}
