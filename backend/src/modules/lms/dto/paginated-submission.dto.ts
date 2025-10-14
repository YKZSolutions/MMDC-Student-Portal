import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { GradingConfigDto } from '@/generated/nestjs-dto/gradingConfig.dto';
import { SubmissionAttachmentDto } from '@/generated/nestjs-dto/submissionAttachment.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';

export class SubmissionDetailsDto extends AssignmentSubmissionDto {
  grade?: GradeRecordDto;
  student: UserDto;
  assignment: AssignmentDto;
  grading?: GradingConfigDto;
  attachments: SubmissionAttachmentDto[];
}
