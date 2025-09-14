import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { StudentAssignmentDto } from '@/modules/content/assignment/dto/student-assignment.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { StudentSubmissionDto } from '@/modules/lms/dto/student-submission.dto';
import { Type } from 'class-transformer';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

export class StudentBaseContentDto extends OmitType(ModuleContentDto, [
  'toPublishAt',
  'publishedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}

export class StudentStaticContentDto extends StudentBaseContentDto {}

export class StudentContentWithProgressDto extends IntersectionType(
  StudentBaseContentDto,
  PickType(ModuleContent, ['studentProgress']),
) {}

export class StudentSubmittableContentDto extends StudentContentWithProgressDto {
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

export type StudentContentDto =
  | StudentStaticContentDto
  | StudentContentWithProgressDto
  | StudentSubmittableContentDto;
