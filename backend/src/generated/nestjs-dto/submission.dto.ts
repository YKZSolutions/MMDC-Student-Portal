import { SubmissionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDto {
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
    enum: SubmissionStatus,
    enumName: 'SubmissionStatus',
  })
  status: SubmissionStatus;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  score: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  attemptNumber: number | null;
  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  isLate: boolean | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  lateDays: number | null;
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
