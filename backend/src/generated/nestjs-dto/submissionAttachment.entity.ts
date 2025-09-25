import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';
import {
  QuizSubmission,
  type QuizSubmission as QuizSubmissionAsType,
} from './quizSubmission.entity';

export class SubmissionAttachment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  assignmentSubmission?: AssignmentSubmissionAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  assignmentSubmissionId: string | null;
  @ApiHideProperty()
  quizSubmission?: QuizSubmissionAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  quizSubmissionId: string | null;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  fileUrl: string;
  @ApiProperty({
    type: 'string',
  })
  type: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  size: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
