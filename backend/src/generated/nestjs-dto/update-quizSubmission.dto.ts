import { Prisma, SubmissionState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsInt, IsOptional } from 'class-validator';

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
    type: 'string',
    format: 'Decimal.js',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDecimal()
  rawScore?: Prisma.Decimal | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  questionResults?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  timeSpent?: number | null;
}
