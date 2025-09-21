import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { DueFilterDto } from '@/common/dto/due-filter.dto';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';

export class FilterAssignmentsDto extends IntersectionType(
  OmitType(PartialType(AssignmentDto), ['content'] as const),
  DueFilterDto,
) {}

export class ExtendedFilterAssignmentsDto extends IntersectionType(
  BaseFilterDto,
  AuditFilterDto,
) {}
