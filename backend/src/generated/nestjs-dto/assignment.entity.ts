import { AssignmentMode } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import {
  RubricTemplate,
  type RubricTemplate as RubricTemplateAsType,
} from './rubricTemplate.entity';
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
    type: () => RubricTemplate,
    required: false,
    nullable: true,
  })
  rubricTemplate?: RubricTemplateAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  rubricTemplateId: string | null;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
  })
  mode: AssignmentMode;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxScore: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  weightPercentage: number;
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
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  latePenalty: number | null;
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
  @ApiHideProperty()
  submissions?: AssignmentSubmissionAsType[];
}
