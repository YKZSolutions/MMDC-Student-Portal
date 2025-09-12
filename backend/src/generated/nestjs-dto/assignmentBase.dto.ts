import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  Prisma,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentBaseDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
