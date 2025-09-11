import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { StudentAssignmentDto } from '@/modules/assignment/dto/student-assignment.dto';
import { StudentSubmissionDto } from '@/modules/lms/dto/student-submission.dto';

export class StudentContentDto extends OmitType(ModuleContentDto, [
  'toPublishAt',
  'publishedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {
  @ApiProperty({ type: StudentAssignmentDto, required: false })
  assignment?: StudentAssignmentDto;
  @ApiProperty({
    type: StudentSubmissionDto,
    required: false,
  })
  submission?: StudentSubmissionDto;
}
