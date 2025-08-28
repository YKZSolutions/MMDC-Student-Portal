import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class FilterCourseOfferingDto extends BaseFilterDto {
  @IsOptional()
  @IsUUID()
  periodId?: string;
}
