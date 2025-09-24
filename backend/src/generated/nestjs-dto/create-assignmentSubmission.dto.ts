import { Prisma, SubmissionState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateAssignmentSubmissionDto {
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
  })
  @IsNotEmpty()
  @IsEnum(SubmissionState)
  state: SubmissionState;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  groupSnapshot?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
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
