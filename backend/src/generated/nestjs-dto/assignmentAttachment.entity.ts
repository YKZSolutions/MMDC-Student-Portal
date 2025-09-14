import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';

export class AssignmentAttachment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  submissionId: string;
  @ApiHideProperty()
  submission?: AssignmentSubmissionAsType;
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
