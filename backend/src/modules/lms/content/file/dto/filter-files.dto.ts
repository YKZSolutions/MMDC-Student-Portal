import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterFilesDto extends BaseFilterDto {
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

  @ApiPropertyOptional({ type: 'string' })
  fileUrl?: string;

  @ApiPropertyOptional({ type: 'string' })
  fileType?: string;

  @ApiPropertyOptional({ type: 'integer', format: 'int32' })
  fileSize?: number;

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
}
