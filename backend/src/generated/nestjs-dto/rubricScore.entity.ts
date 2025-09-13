import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AssignmentGradeRecord,
  type AssignmentGradeRecord as AssignmentGradeRecordAsType,
} from './assignmentGradeRecord.entity';

export class RubricScore {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  gradeRecord?: AssignmentGradeRecordAsType;
  @ApiProperty({
    type: 'string',
  })
  gradeRecordId: string;
  @ApiProperty({
    type: 'string',
  })
  criterionKey: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  label: string | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  maxPoints: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  score: Prisma.Decimal;
}
