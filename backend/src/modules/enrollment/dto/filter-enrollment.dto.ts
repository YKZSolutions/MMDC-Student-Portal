import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FilterEnrollmentDto extends BaseFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number) // Converts string "1" → number 1
  @Min(1, { message: 'Term must be at least 1' })
  @Max(3, { message: 'Term cannot be greater than 3' })
  term?: number;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  @ApiProperty({ enum: EnrollmentStatus, required: false })
  status?: EnrollmentStatus;
}
