import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentGradeRecordSubmissionIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;
}

@ApiExtraModels(AssignmentGradeRecordSubmissionIdUniqueInputDto)
export class ConnectAssignmentGradeRecordDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionId?: string;
  @ApiProperty({
    type: AssignmentGradeRecordSubmissionIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssignmentGradeRecordSubmissionIdUniqueInputDto)
  submissionId?: AssignmentGradeRecordSubmissionIdUniqueInputDto;
}
