import { AssignmentMode, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(AssignmentMode)
  mode?: AssignmentMode | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  maxScore?: Prisma.Decimal;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  weightPercentage?: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  maxAttempts?: number | null;
  @ApiProperty({
    type: 'boolean',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDecimal()
  latePenalty?: Prisma.Decimal | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  gracePeriodMinutes?: number | null;
}
