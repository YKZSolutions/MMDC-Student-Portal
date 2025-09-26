import { Prisma, SubmissionState } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Quiz, type Quiz as QuizAsType } from './quiz.entity';
import { User, type User as UserAsType } from './user.entity';
import {
  GradeRecord,
  type GradeRecord as GradeRecordAsType,
} from './gradeRecord.entity';
import {
  SubmissionAttachment,
  type SubmissionAttachment as SubmissionAttachmentAsType,
} from './submissionAttachment.entity';

export class QuizSubmission {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  quiz?: QuizAsType;
  @ApiProperty({
    type: 'string',
  })
  quizId: string;
  @ApiHideProperty()
  student?: UserAsType;
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
    type: () => Object,
    isArray: true,
  })
  answers: Prisma.JsonValue[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  timeSpent: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  attemptNumber: number;
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
  lateDays: number | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  rawScore: Prisma.Decimal | null;
  @ApiProperty({
    type: () => GradeRecord,
    required: false,
    nullable: true,
  })
  gradeRecord?: GradeRecordAsType | null;
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
}
