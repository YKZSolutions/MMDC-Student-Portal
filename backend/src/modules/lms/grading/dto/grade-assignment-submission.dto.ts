import { ApiProperty, PickType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';
import { UpdateGradeRecordDto } from '@/generated/nestjs-dto/update-gradeRecord.dto';

export class GradeAssignmentSubmissionDto extends PickType(
  UpdateGradeRecordDto,
  ['rawScore', 'feedback', 'rubricScores'],
) {
  @ApiProperty({
    description: 'The raw score given to the submission before any penalties.',
    type: String,
    example: '85.50',
  })
  @IsNotEmpty()
  rawScore: Prisma.Decimal;
}
