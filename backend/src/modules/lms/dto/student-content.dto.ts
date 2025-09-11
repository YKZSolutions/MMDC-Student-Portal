import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { StudentAssignmentDto } from '@/modules/assignment/dto/student-assignment.dto';
import { StudentSubmissionDto } from '@/modules/lms/dto/student-submission.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentContentDto extends OmitType(ModuleContentDto, [
  'toPublishAt',
  'publishedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {
  @ApiProperty({ type: StudentAssignmentDto, required: false })
  @ValidateNested()
  @IsOptional()
  @Type(() => StudentAssignmentDto)
  assignment?: StudentAssignmentDto;
  @ApiProperty({
    type: StudentSubmissionDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => StudentSubmissionDto)
  submission?: StudentSubmissionDto;
}
