import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AssignmentGrading,
  type AssignmentGrading as AssignmentGradingAsType,
} from './assignmentGrading.entity';
import { User, type User as UserAsType } from './user.entity';
import {
  RubricScore,
  type RubricScore as RubricScoreAsType,
} from './rubricScore.entity';

export class AssignmentGradeRecord {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  grading?: AssignmentGradingAsType;
  @ApiProperty({
    type: 'string',
  })
  gradingId: string;
  @ApiHideProperty()
  student?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
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
  @ApiHideProperty()
  rubricScores?: RubricScoreAsType[];
  @ApiProperty({
    type: 'string',
  })
  gradedById: string;
  @ApiHideProperty()
  gradedBy?: UserAsType;
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
