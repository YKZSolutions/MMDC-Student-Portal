import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import { User, type User as UserAsType } from './user.entity';
import {
  SubmissionAttachment,
  type SubmissionAttachment as SubmissionAttachmentAsType,
} from './submissionAttachment.entity';

export class Submission {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  submission: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  score: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  grade: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  feedback: string | null;
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
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  submittedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  gradedAt: Date | null;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiHideProperty()
  moduleContent?: ModuleContentAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiHideProperty()
  student?: UserAsType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gradedBy: string | null;
  @ApiHideProperty()
  grader?: UserAsType | null;
  @ApiHideProperty()
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
