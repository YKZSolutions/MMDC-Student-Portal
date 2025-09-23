import { Prisma, SubmissionState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class QuizSubmissionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
  })
  state: SubmissionState;
  @ApiProperty({
    type: () => Object,
  })
  answers: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  rawScore: Prisma.Decimal | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  questionResults: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  submittedAt: Date;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  timeSpent: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  attemptNumber: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
