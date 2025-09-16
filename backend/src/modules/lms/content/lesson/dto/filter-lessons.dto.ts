import { IntersectionType, OmitType } from '@nestjs/swagger';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { LessonDto } from '@/generated/nestjs-dto/lesson.dto';

export class FilterLessonsDto extends OmitType(LessonDto, [
  'content',
] as const) {}

export class ExtendedFilterLessonsDto extends IntersectionType(
  FilterLessonsDto,
  AuditFilterDto,
) {}
