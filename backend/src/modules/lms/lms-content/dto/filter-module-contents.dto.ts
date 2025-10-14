import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ContentType, ProgressStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

//TODO: Omit protected fields from the request
export class FilterModuleContentsDto extends BaseFilterDto {
  @ApiPropertyOptional({
    enum: ContentType,
    enumName: 'ContentType',
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({
    enum: ProgressStatus,
    enumName: 'ProgressStatus',
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progress?: ProgressStatus;
}
