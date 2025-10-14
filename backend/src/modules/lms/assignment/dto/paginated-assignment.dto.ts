import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { SubmissionAttachmentDto } from '@/generated/nestjs-dto/submissionAttachment.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { PickType } from '@nestjs/swagger';

class AssignmentStatsDto {
  submitted: number;
  graded: number;
  total: number;
}

// Admin
class AdminAssignmentItemDto extends AssignmentDto {
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

class MentorAssignmentItemDto extends AssignmentDto {
  stats: AssignmentStatsDto;
  submissions: MentorAssignmentSubmissionItemDto[];
}

export class PaginatedMentorAssignmentDto extends PaginatedDto {
  assignments: MentorAssignmentItemDto[];
}

// Student
class StudentAssignmentSubmissionItemDto extends AssignmentSubmissionDto {
  attachments?: SubmissionAttachmentDto[];
  grade?: GradeRecordDto | null;
}

export class StudentAssignmentItemDto extends AssignmentDto {
  submissions: StudentAssignmentSubmissionItemDto[];
}

export class PaginatedStudentAssignmentDto extends PaginatedDto {
  assignments: StudentAssignmentItemDto[];
}
