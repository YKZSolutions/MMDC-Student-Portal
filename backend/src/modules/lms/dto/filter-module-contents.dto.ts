import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ModuleSectionDto } from '@/generated/nestjs-dto/moduleSection.dto';
import { StudentDetailsDto } from '@/generated/nestjs-dto/studentDetails.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { FilterAssignmentsDto } from '@/modules/lms/content/assignment/dto/filter-assignments.dto';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { AuditFilterDto } from '@/common/dto/audit-filter.dto';
import { FilterQuizzesDto } from '@/modules/lms/content/quiz/dto/filter-quizzes.dto';
import { FilterDiscussionsDto } from '@/modules/lms/content/discussion/dto/filter-discussions.dto';

//TODO: Omit protected fields from the request
export class FilterModuleContentsDto extends BaseFilterDto {
  studentFilter?: StudentDetailsDto;
  enrollmentFilter?: EnrollmentPeriodDto;
  moduleFilter?: ModuleDto & AuditFilterDto;
  sectionFilter?: ModuleSectionDto & AuditFilterDto;
  contentFilter?: ModuleContentDto & AuditFilterDto;
  assignmentFilter?: FilterAssignmentsDto;
  quizFilter?: FilterQuizzesDto;
  discussionFilter?: FilterDiscussionsDto;
}
