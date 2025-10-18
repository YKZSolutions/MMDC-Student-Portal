import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { PaginatedDto } from '@/common/dto/paginated.dto';
import {
  FullGradableAssignmentItem,
  GradableAssignmentItem,
} from '@/modules/lms/grading/dto/gradable-item.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GradeRecord } from '@/generated/nestjs-dto/gradeRecord.entity';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';

export class CurrentGradeDto extends PickType(GradeRecord, [
  'id',
  'rawScore',
  'finalScore',
  'grade',
  'gradedAt',
  'feedback',
  'rubricEvaluationDetails',
]) {}

export class StudentViewGradeEntryDto {
  @ApiProperty({
    type: CurrentGradeDto,
    required: false,
    nullable: true,
  })
  currentGrade: CurrentGradeDto | null;

  @ApiProperty({
    type: () => AssignmentSubmissionDto,
    isArray: true,
    required: true,
  })
  submission: AssignmentSubmissionDto;

  @ApiProperty({
    type: GradableAssignmentItem,
    required: true,
    nullable: false,
  })
  gradableItem: GradableAssignmentItem;
}

export class GradebookForStudentDto extends PaginatedDto {
  @ApiProperty({
    type: UserDto,
  })
  student: UserDto;

  @ApiProperty({
    type: [StudentViewGradeEntryDto],
  })
  @Type(() => StudentViewGradeEntryDto)
  @ValidateNested({ each: true })
  gradeRecords: StudentViewGradeEntryDto[];
}

export class GradebookForMentorDto extends PaginatedDto {
  @ApiProperty({ type: [FullGradableAssignmentItem] })
  @Type(() => FullGradableAssignmentItem)
  @ValidateNested({ each: true })
  gradeRecords: FullGradableAssignmentItem[];
}
