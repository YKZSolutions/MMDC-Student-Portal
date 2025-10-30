import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class BaseFilterDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'number', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Page number must be greater or equal to 1' })
  @Type(() => Number)
  page?: number;

  @ApiProperty({ type: 'number', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Page limit must be greater or equal to 1' })
  @Type(() => Number)
  limit?: number;
}
