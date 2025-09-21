import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { DueFilterDto } from '@/common/dto/due-filter.dto';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { QuizDto } from '@/generated/nestjs-dto/quiz.dto';

export class FilterQuizzesDto extends IntersectionType(
  OmitType(PartialType(QuizDto), ['content', 'questions'] as const),
  DueFilterDto,
) {}

export class ExtendedFilterQuizzesDto extends IntersectionType(
  BaseFilterDto,
  AuditFilterDto,
) {}
