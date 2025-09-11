import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Submission,
  type Submission as SubmissionAsType,
} from './submission.entity';

export class SubmissionAttachment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  submissionId: string;
  @ApiHideProperty()
  submission?: SubmissionAsType;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  attachment: string;
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
