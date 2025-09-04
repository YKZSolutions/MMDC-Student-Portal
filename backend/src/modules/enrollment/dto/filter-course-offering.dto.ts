import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum CourseOfferingStatus {
  NOT_ENROLLED = 'not enrolled',
  ENROLLED = 'enrolled',
}
export class FilterCourseOfferingDto extends BaseFilterDto {
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @IsOptional()
  @IsEnum(CourseOfferingStatus)
  status?: CourseOfferingStatus;
}
