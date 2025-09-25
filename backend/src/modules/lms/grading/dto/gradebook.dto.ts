import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { Prisma, SubmissionState } from '@prisma/client';
import { PaginatedDto } from '@/common/dto/paginated.dto';

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
  students: UserDto[];

  @ApiProperty({ type: [ModuleContentDto] })
  gradableItems: ModuleContentDto[];

  @ApiProperty({ type: [GradebookEntryDto] })
  grades: GradebookEntryDto[];
}
