import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterProgramDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ type: 'number', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;
}
