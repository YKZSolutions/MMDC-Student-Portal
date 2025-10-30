import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { SubmissionAttachmentDto } from '@/generated/nestjs-dto/submissionAttachment.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

class AssignmentStatsDto {
  submitted: number;
  graded: number;
  total: number;
}

class BaseAssignmentItemDto extends IntersectionType(
  AssignmentDto,
  PickType(Assignment, ['rubricTemplateId']),
  PickType(ModuleContent, ['title', 'subtitle', 'content', 'id']),
) {
  moduleContentId: string;
}

// Admin
class AdminAssignmentItemDto extends BaseAssignmentItemDto {
  stats: AssignmentStatsDto;
}

export class PaginatedAssignmentDto extends PaginatedDto {
  assignments: AdminAssignmentItemDto[];
}

// Mentor

class GradeRecordItemDto extends PickType(GradeRecordDto, [
  'id',
  'grade',
  'rawScore',
  'finalScore',
  'gradedAt',
]) {}

class MentorAssignmentSubmissionItemDto extends PickType(
  AssignmentSubmissionDto,
  ['id', 'submittedAt'],
) {
  attachments?: SubmissionAttachmentDto[];
  grade?: GradeRecordItemDto | null;
  student: UserDto;
}

class MentorAssignmentItemDto extends BaseAssignmentItemDto {
  stats: AssignmentStatsDto;
  submissions: MentorAssignmentSubmissionItemDto[];
}

export class PaginatedMentorAssignmentDto extends PaginatedDto {
  assignments: MentorAssignmentItemDto[];
}

// Student
export class StudentAssignmentSubmissionItemDto extends AssignmentSubmissionDto {
  attachments?: SubmissionAttachmentDto[];
  grade?: GradeRecordDto | null;
}

export class StudentAssignmentItemDto extends BaseAssignmentItemDto {
  submissions: StudentAssignmentSubmissionItemDto[];
}

export class PaginatedStudentAssignmentDto extends PaginatedDto {
  assignments: StudentAssignmentItemDto[];
}
