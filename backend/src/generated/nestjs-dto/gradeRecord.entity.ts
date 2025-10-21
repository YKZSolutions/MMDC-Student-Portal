import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';

export class GradeRecord {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  student?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiProperty({
    type: () => AssignmentSubmission,
    required: false,
    nullable: true,
  })
  assignmentSubmission?: AssignmentSubmissionAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  assignmentSubmissionId: string | null;
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
    isArray: true,
  })
  rubricEvaluationDetails: PrismaJson.RubricEvaluationDetail[];
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
