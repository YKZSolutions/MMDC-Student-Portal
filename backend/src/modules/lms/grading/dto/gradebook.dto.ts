import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { Prisma, SubmissionState } from '@prisma/client';
import { PaginatedDto } from '@/common/dto/paginated.dto';
import { GradableAssignmentItem } from '@/modules/lms/grading/dto/gradable-item.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class GradebookEntryDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  gradableItemId: string;

  @ApiProperty({ nullable: true })
  submissionId: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'Decimal.js' })
  score: Prisma.Decimal | null;

  @ApiProperty({ enum: SubmissionState, nullable: true })
  status: SubmissionState | 'NOT_SUBMITTED';
}

export class GradebookViewDto extends PaginatedDto {
  @ApiProperty({ type: [UserDto] })
  @Type(() => UserDto)
  @ValidateNested({ each: true })
  students: UserDto[];

  @ApiProperty({ type: [GradableAssignmentItem] })
  @Type(() => GradableAssignmentItem)
  @ValidateNested({ each: true })
  gradableAssignmentItems: GradableAssignmentItem[];

  @ApiProperty({ type: [GradebookEntryDto] })
  @Type(() => GradebookEntryDto)
  @ValidateNested({ each: true })
  grades: GradebookEntryDto[];
}
