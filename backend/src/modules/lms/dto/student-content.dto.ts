import { StudentAssignmentDto } from '@/modules/assignment/dto/student-assignment.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { SubmissionDto } from '@/generated/nestjs-dto/submission.dto';
import { ContentProgressDto } from '@/generated/nestjs-dto/contentProgress.dto';

export class StudentContentDto extends IntersectionType(
  ModuleContentDto,
  PartialType(StudentAssignmentDto),
  PartialType(SubmissionDto),
  PartialType(ContentProgressDto),
) {}
