import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IntersectionType, OmitType } from '@nestjs/swagger';
import { DueFilterDto } from '@/common/dto/due-filter.dto';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { DiscussionDto } from '@/generated/nestjs-dto/discussion.dto';

export class FilterDiscussionsDto extends IntersectionType(
  OmitType(DiscussionDto, ['content'] as const),
  DueFilterDto,
) {}

export class ExtendedFilterDiscussionsDto extends IntersectionType(
  BaseFilterDto,
  AuditFilterDto,
) {}
