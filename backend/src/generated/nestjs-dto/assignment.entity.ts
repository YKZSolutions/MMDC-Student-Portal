import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  Prisma,
} from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

export class Assignment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiHideProperty()
  moduleContent?: ModuleContentAsType;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: () => Object,
  })
  rubric: Prisma.JsonValue;
  @ApiProperty({
    enum: AssignmentType,
    enumName: 'AssignmentType',
  })
  type: AssignmentType;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
  })
  mode: AssignmentMode;
  @ApiProperty({
    enum: AssignmentStatus,
    enumName: 'AssignmentStatus',
  })
  status: AssignmentStatus;
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
  points: number | null;
  @ApiProperty({
    type: 'boolean',
  })
  allowResubmission: boolean;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  maxAttempts: number | null;
  @ApiProperty({
    type: 'boolean',
  })
  allowLateSubmission: boolean;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  latePenalty: Prisma.Decimal | null;
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
}
