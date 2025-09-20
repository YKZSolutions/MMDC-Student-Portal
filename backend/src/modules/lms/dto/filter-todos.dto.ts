import { IntersectionType } from '@nestjs/swagger';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DueFilterDto } from '@/common/dto/due-filter.dto';

export class FilterTodosDto extends IntersectionType(
  BaseFilterDto,
  DueFilterDto,
) {}
