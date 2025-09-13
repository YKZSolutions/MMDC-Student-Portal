import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizSubmissionQuizIdStudentIdAttemptNumberUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  quizId: string;
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

@ApiExtraModels(QuizSubmissionQuizIdStudentIdAttemptNumberUniqueInputDto)
export class ConnectQuizSubmissionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: QuizSubmissionQuizIdStudentIdAttemptNumberUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizSubmissionQuizIdStudentIdAttemptNumberUniqueInputDto)
  quizId_studentId_attemptNumber?: QuizSubmissionQuizIdStudentIdAttemptNumberUniqueInputDto;
}
