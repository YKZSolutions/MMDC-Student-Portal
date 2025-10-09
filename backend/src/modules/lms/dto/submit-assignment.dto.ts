import { CreateAssignmentSubmissionDto } from '@/generated/nestjs-dto/create-assignmentSubmission.dto';
import { PickType } from '@nestjs/swagger';

export class SubmitAssignmentDto extends PickType(
  CreateAssignmentSubmissionDto,
  ['state', 'content'],
) {}
