import { Prisma, SubmissionState } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import {
  AssignmentGradeRecord,
  type AssignmentGradeRecord as AssignmentGradeRecordAsType,
} from './assignmentGradeRecord.entity';
import { User, type User as UserAsType } from './user.entity';
import { Group, type Group as GroupAsType } from './group.entity';
import {
  AssignmentAttachment,
  type AssignmentAttachment as AssignmentAttachmentAsType,
} from './assignmentAttachment.entity';

export class AssignmentSubmission {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  assignmentId: string;
  @ApiProperty({
    type: () => Assignment,
    required: false,
  })
  assignment?: AssignmentAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
  })
  state: SubmissionState;
  @ApiProperty({
    type: () => AssignmentGradeRecord,
    required: false,
    nullable: true,
  })
  gradeRecord?: AssignmentGradeRecordAsType | null;
  @ApiHideProperty()
  student?: UserAsType;
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
    type: () => Object,
    nullable: true,
  })
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
    nullable: true,
  })
  attemptNumber: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  lateDays: number | null;
  @ApiProperty({
    type: () => AssignmentAttachment,
    isArray: true,
    required: false,
  })
  attachments?: AssignmentAttachmentAsType[];
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
