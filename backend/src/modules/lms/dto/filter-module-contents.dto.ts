import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ContentType, ProgressStatus } from '@prisma/client';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EnrollmentPeriodFilterDto extends PartialType(
  PickType(EnrollmentPeriodDto, ['startYear', 'endYear', 'status', 'term']),
) {}

//TODO: Omit protected fields from the request
export class FilterModuleContentsDto extends BaseFilterDto {
  @ApiPropertyOptional({ type: EnrollmentPeriodFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentPeriodFilterDto)
  enrollmentPeriod?: EnrollmentPeriodFilterDto;

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

  // @ApiPropertyOptional({ type: FilterAssignmentsDto })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => FilterAssignmentsDto)
  // assignmentFilter?: FilterAssignmentsDto;
  //
  // @ApiPropertyOptional({ type: FilterQuizzesDto })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => FilterQuizzesDto)
  // quizFilter?: FilterQuizzesDto;
}
