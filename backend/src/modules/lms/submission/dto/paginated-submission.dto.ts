import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { SubmissionAttachmentDto } from '@/generated/nestjs-dto/submissionAttachment.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';

export class AssignmentSubmissionDetailsDto extends AssignmentSubmissionDto {
  @ApiProperty({
    type: () => GradeRecordDto,
    required: false,
    nullable: true,
  })
  gradeRecord?: GradeRecordDto | null;

  @ApiProperty({
    type: UserDto,
  })
  student: UserDto;

  @ApiProperty({
    type: () => Assignment,
    required: false,
  })
  assignment: AssignmentDto;

  @ApiProperty({
    type: () => SubmissionAttachmentDto,
    isArray: true,
    required: false,
  })
  attachments: SubmissionAttachmentDto[];
}
