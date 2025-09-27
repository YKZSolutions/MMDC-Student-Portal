import { AssignmentMode, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import {
  GradingConfig,
  type GradingConfig as GradingConfigAsType,
} from './gradingConfig.entity';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';
import { IsArray } from 'class-validator';

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
    isArray: true,
  })
  @IsArray()
  content: Prisma.JsonValue | null;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
    nullable: true,
  })
  mode: AssignmentMode | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  maxAttempts: number | null;
  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  allowLateSubmission: boolean | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  latePenalty: Prisma.Decimal | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dueDate: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  gracePeriodMinutes: number | null;
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
    type: () => GradingConfig,
    required: false,
    nullable: true,
  })
  grading?: GradingConfigAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gradingId: string | null;
  @ApiHideProperty()
  submissions?: AssignmentSubmissionAsType[];
}
