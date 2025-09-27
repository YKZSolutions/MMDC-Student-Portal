import { Prisma, SubmissionState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
} from 'class-validator';

export class UpdateAssignmentSubmissionDto {
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  groupSnapshot?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
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
    nullable: true,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
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
}
