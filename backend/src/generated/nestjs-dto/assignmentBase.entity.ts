import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  Prisma,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

export class AssignmentBase {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiProperty({
    type: () => ModuleContent,
    required: false,
  })
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
    type: 'string',
    format: 'date-time',
  })
  dueDate: Date;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
  })
  mode: AssignmentMode;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  points: number | null;
  @ApiProperty({
    enum: AssignmentStatus,
    enumName: 'AssignmentStatus',
  })
  status: AssignmentStatus;
  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  allowResubmission: boolean | null;
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
