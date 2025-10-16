import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { PaginatedDto } from '@/common/dto/paginated.dto';
import { GradableAssignmentItem } from '@/modules/lms/grading/dto/gradable-item.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GradeRecord } from '@/generated/nestjs-dto/gradeRecord.entity';

export class GradeEntryDto extends PickType(GradeRecord, [
  'id',
  'rawScore',
  'finalScore',
  'grade',
  'gradedAt',
  'feedback',
  'rubricEvaluationDetails',
]) {
  @ApiProperty({
    type: GradableAssignmentItem,
    required: false,
    nullable: true,
  })
  submission: GradableAssignmentItem;
}

export class GradebookDto {
  @ApiProperty({
    type: UserDto,
  })
  student: UserDto;

  @ApiProperty({
    type: [GradeEntryDto],
  })
  @Type(() => GradeEntryDto)
  @ValidateNested({ each: true })
  grades: GradeEntryDto[];
}

export class GradebookForStudentDto extends IntersectionType(
  GradebookDto,
  PaginatedDto,
) {}

export class GradebookForMentorDto extends PaginatedDto {
  @ApiProperty({ type: [GradebookDto] })
  @Type(() => GradebookDto)
  @ValidateNested({ each: true })
  grades: GradebookDto[];
}
