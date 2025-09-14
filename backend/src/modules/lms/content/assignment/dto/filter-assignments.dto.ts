import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentMode } from '@prisma/client';

export class FilterAssignmentsDto extends BaseFilterDto {
  @ApiPropertyOptional({ type: 'string' })
  id?: string;

  @ApiPropertyOptional({ type: 'string' })
  moduleContentId?: string;

  @ApiPropertyOptional({ type: 'string' })
  title?: string;

  @ApiPropertyOptional({ type: 'string' })
  titleContains?: string;

  @ApiPropertyOptional({ type: 'string' })
  subtitle?: string;

  @ApiPropertyOptional({ type: 'string' })
  subtitleContains?: string;

  @ApiPropertyOptional({ enum: AssignmentMode })
  mode?: AssignmentMode;

  @ApiPropertyOptional({ type: 'integer', format: 'int32' })
  maxAttempts?: number;

  @ApiPropertyOptional({ type: 'boolean' })
  allowLateSubmission?: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  dueDateFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  dueDateTo?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  createdAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  createdAtTo?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  updatedAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  updatedAtTo?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  deletedAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  deletedAtTo?: Date;

  @ApiPropertyOptional({ type: 'string' })
  gradingId?: string;
}
