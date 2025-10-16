import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';

export class GradebookFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ description: 'Filter by Module ID.' })
  @IsNotEmpty()
  @IsUUID()
  moduleId: string;

  @ApiPropertyOptional({
    description: 'Filter by a specific Course Section ID (Admin only).',
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by a specific Student ID (Admin only).',
  })
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by a specific Course Offering ID (Admin only).',
  })
  @IsOptional()
  @IsUUID()
  courseOfferingId?: string;

  @ApiPropertyOptional({
    description: 'Filter by a specific Course Section ID (Admin only).',
  })
  @IsOptional()
  @IsUUID()
  courseSectionId?: string;
}
