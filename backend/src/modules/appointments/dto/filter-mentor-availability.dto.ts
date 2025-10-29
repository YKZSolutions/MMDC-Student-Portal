import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { Type } from 'class-transformer';

export class FilterMentorAvailabilityDto extends BaseFilterDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsString()
  mentorId?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(240)
  duration?: number; // in minutes

  @IsOptional()
  @IsString()
  timezone?: string;
}
