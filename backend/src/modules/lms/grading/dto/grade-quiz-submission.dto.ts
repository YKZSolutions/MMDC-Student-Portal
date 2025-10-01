import { ApiProperty, PickType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { UpdateGradeRecordDto } from '@/generated/nestjs-dto/update-gradeRecord.dto';

export class GradeQuizSubmissionDto extends PickType(UpdateGradeRecordDto, [
  'rawScore',
  'feedback',
  'questionScores',
]) {
  @ApiProperty({
    description:
      'Optional. The raw score for the quiz, overriding any auto-graded score. If not provided, the existing auto-graded score will be used.',
    type: String,
    example: '92.00',
    required: false,
  })
  @IsOptional()
  rawScore?: Prisma.Decimal;
}
