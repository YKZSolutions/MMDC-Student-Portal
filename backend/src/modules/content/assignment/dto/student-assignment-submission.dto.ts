import { OmitType } from '@nestjs/swagger';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';

export class StudentSubmissionDto extends OmitType(AssignmentSubmissionDto, [
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
