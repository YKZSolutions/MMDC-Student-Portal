import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { SubmissionState } from '@prisma/client';

export class ReturnForRevisionDto {
  @ApiProperty({
    description: 'Feedback explaining why the submission is being returned',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;
}

export class ResubmissionResponseDto {
  @ApiProperty({ description: 'Submission ID' })
  id: string;

  @ApiProperty({ description: 'New state of the submission' })
  state: SubmissionState;

  @ApiProperty({ description: 'Attempt number' })
  attemptNumber: number;

  @ApiProperty({ description: 'Whether this is a resubmission' })
  isResubmission: boolean;
}
