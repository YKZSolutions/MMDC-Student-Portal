import { OmitType } from '@nestjs/swagger';
import { SubmissionDto } from '@/generated/nestjs-dto/submission.dto';

export class StudentSubmissionDto extends OmitType(SubmissionDto, [
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
