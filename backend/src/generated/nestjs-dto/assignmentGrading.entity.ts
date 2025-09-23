import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import {
  AssignmentGradeRecord,
  type AssignmentGradeRecord as AssignmentGradeRecordAsType,
} from './assignmentGradeRecord.entity';

export class AssignmentGrading {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Object,
  })
  gradingSchema: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  weight: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  isCurved: boolean | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  curveSettings: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
  @ApiHideProperty()
  assignments?: AssignmentAsType[];
  @ApiHideProperty()
  gradeRecords?: AssignmentGradeRecordAsType[];
}
