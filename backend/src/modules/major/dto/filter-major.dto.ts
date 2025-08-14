import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterMajorDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
