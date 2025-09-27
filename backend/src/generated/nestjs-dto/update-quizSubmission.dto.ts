import { Prisma, SubmissionState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UpdateQuizSubmissionDto {
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
    required: false,
  })
  @IsOptional()
  @IsEnum(SubmissionState)
  state?: SubmissionState;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  answers?: Prisma.InputJsonValue;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  timeSpent?: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    default: new Date().toISOString(),
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  submittedAt?: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  lateDays?: number | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDecimal()
  rawScore?: Prisma.Decimal | null;
}
