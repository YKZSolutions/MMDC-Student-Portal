import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentGradeRecordDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  rawScore: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  finalScore: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  grade: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  feedback: string | null;
  @ApiProperty({
    type: () => Object,
  })
  rubricScores: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  gradedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
