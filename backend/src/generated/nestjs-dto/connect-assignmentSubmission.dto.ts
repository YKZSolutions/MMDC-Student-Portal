import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentSubmissionAssignmentIdStudentIdAttemptNumberUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  assignmentId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  studentId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
  })
  @IsNotEmpty()
  @IsInt()
  attemptNumber: number;
}

@ApiExtraModels(
  AssignmentSubmissionAssignmentIdStudentIdAttemptNumberUniqueInputDto,
)
export class ConnectAssignmentSubmissionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: AssignmentSubmissionAssignmentIdStudentIdAttemptNumberUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(
    () => AssignmentSubmissionAssignmentIdStudentIdAttemptNumberUniqueInputDto,
  )
  assignmentId_studentId_attemptNumber?: AssignmentSubmissionAssignmentIdStudentIdAttemptNumberUniqueInputDto;
}
