import { AssignmentMode } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
    default: 'INDIVIDUAL',
    required: false,
  })
  @IsOptional()
  @IsEnum(AssignmentMode)
  mode?: AssignmentMode;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  maxScore?: number;
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
    default: false,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  latePenalty?: number | null;
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
