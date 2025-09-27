import { Prisma, SubmissionState } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import { User, type User as UserAsType } from './user.entity';
import { Group, type Group as GroupAsType } from './group.entity';
import {
  GradeRecord,
  type GradeRecord as GradeRecordAsType,
} from './gradeRecord.entity';
import {
  SubmissionAttachment,
  type SubmissionAttachment as SubmissionAttachmentAsType,
} from './submissionAttachment.entity';
import { IsArray } from 'class-validator';

export class AssignmentSubmission {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Assignment,
    required: false,
  })
  assignment?: AssignmentAsType;
  @ApiProperty({
    type: 'string',
  })
  assignmentId: string;
  @ApiHideProperty()
  student?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  groupId: string | null;
  @ApiProperty({
    type: () => Group,
    required: false,
    nullable: true,
  })
  group?: GroupAsType | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  groupSnapshot: Prisma.JsonValue | null;
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
  })
  state: SubmissionState;
  @ApiProperty({
    type: () => GradeRecord,
    required: false,
    nullable: true,
  })
  gradeRecord?: GradeRecordAsType | null;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    isArray: true,
  })
  @IsArray()
  content: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  submittedAt: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  attemptNumber: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  lateDays: number | null;
  @ApiProperty({
    type: () => SubmissionAttachment,
    isArray: true,
    required: false,
  })
  attachments?: SubmissionAttachmentAsType[];
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
