import { CreateAssignmentSubmissionDto } from '@/generated/nestjs-dto/create-assignmentSubmission.dto';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { DetailedGroupDto } from '@/modules/lms/group/dto/detailed-group.dto';
import { Type } from 'class-transformer';

export class SubmitAssignmentDto extends OmitType(
  CreateAssignmentSubmissionDto,
  ['groupSnapshot'],
) {
  @ApiPropertyOptional({
    type: () => DetailedGroupDto,
    required: false,
  })
  @Type(() => DetailedGroupDto)
  groupSnapshot?: DetailedGroupDto;
}
