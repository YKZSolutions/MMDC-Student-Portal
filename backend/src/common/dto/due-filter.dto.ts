import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class DueFilterDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  dueDateFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  dueDateTo?: Date;
}
