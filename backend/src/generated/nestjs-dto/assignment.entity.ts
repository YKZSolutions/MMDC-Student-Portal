import { AssignmentMode, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import {
  AssignmentGrading,
  type AssignmentGrading as AssignmentGradingAsType,
} from './assignmentGrading.entity';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';

export class Assignment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  moduleContent?: ModuleContentAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  subtitle: string | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  content: Prisma.JsonValue | null;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
  })
  mode: AssignmentMode;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxAttempts: number;
  @ApiProperty({
    type: 'boolean',
  })
  allowLateSubmission: boolean;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  latePenalty: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dueDate: Date | null;
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
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gradingId: string | null;
  @ApiProperty({
    type: () => AssignmentGrading,
    required: false,
    nullable: true,
  })
  grading?: AssignmentGradingAsType | null;
  @ApiHideProperty()
  submissions?: AssignmentSubmissionAsType[];
}
