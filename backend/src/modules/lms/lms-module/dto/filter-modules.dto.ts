import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FilterModulesDto extends BaseFilterDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Filter modules by enrollment period ID',
  })
  @IsOptional()
  @IsUUID()
  enrollmentPeriodId?: string;
}
