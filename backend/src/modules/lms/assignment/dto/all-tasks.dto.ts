import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

/**
 * Submission details for all the tasks view
 */
class TaskSubmissionItemDto extends PickType(AssignmentSubmissionDto, [
  'id',
  'state',
  'submittedAt',
  'attemptNumber',
  'lateDays',
]) {
  grade?: GradeRecordDto | null;
}

/**
 * Course context for the task
 */
class TaskCourseDto {
  id: string;
  name: string;
  courseCode: string;
}

/**
 * Module context for task
 */
class TaskModuleDto {
  id: string;
  title: string;
  sectionOrder: number; // The order of the section within the module
}

/**
 * Task item with course and module context
 */
export class AllTaskItemDto extends IntersectionType(
  AssignmentDto,
  PickType(Assignment, ['rubricTemplateId']),
  PickType(ModuleContent, ['title', 'subtitle']),
) {
  moduleContentId: string;

  // Course context
  course: TaskCourseDto;

  // Module context
  module: TaskModuleDto;

  // Student's submissions for this task
  submissions: TaskSubmissionItemDto[];
}

/**
 * Paginated response for all tasks across enrolled courses
 */
export class PaginatedAllTasksDto extends PaginatedDto {
  tasks: AllTaskItemDto[];
}
