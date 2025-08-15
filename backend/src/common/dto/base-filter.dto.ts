import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class BaseFilterDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'number', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;
}
