import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ModuleSectionDto } from '@/generated/nestjs-dto/moduleSection.dto';
import { FilterAssignmentsDto } from '@/modules/lms/content/assignment/dto/filter-assignments.dto';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { FilterQuizzesDto } from '@/modules/lms/content/quiz/dto/filter-quizzes.dto';
import { ProgressStatus } from '@prisma/client';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import {
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EnrollmentPeriodFilterDto extends PartialType(EnrollmentPeriodDto) {}
class ModuleFilterDto extends IntersectionType(
  PartialType(ModuleDto),
  AuditFilterDto,
) {}
class ModuleSectionFilterDto extends PartialType(ModuleSectionDto) {}
class ModuleContentFilterDto extends IntersectionType(
  PartialType(ModuleContentDto),
  AuditFilterDto,
) {}

//TODO: Omit protected fields from the request
export class FilterModuleContentsDto extends BaseFilterDto {
  @ApiPropertyOptional({ type: EnrollmentPeriodFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentPeriodFilterDto)
  enrollmentFilter?: EnrollmentPeriodFilterDto;

  @ApiPropertyOptional({ type: ModuleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleFilterDto)
  moduleFilter?: ModuleFilterDto;

  @ApiPropertyOptional({ type: ModuleSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleSectionFilterDto)
  sectionFilter?: ModuleSectionFilterDto;

  @ApiPropertyOptional({ type: ModuleContentFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleContentFilterDto)
  contentFilter?: ModuleContentFilterDto;

  @ApiPropertyOptional({ enum: ProgressStatus })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progressFilter?: ProgressStatus;

  @ApiPropertyOptional({ type: FilterAssignmentsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterAssignmentsDto)
  assignmentFilter?: FilterAssignmentsDto;

  @ApiPropertyOptional({ type: FilterQuizzesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterQuizzesDto)
  quizFilter?: FilterQuizzesDto;
}
