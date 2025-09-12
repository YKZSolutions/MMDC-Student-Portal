import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class FilterModulesDto extends BaseFilterDto {
  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Start school year (e.g., 2025)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear?: number;

  @ApiProperty({
    type: 'number',
    required: false,
    description: 'End school year (e.g., 2026)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear?: number;

  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Term number (e.g., 1, 2, 3)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  term?: number;
}
