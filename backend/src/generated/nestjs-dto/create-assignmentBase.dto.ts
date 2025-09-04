import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  Prisma,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentBaseDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  rubric: Prisma.InputJsonValue;
  @ApiProperty({
    enum: AssignmentType,
    enumName: 'AssignmentType',
  })
  @IsNotEmpty()
  @IsEnum(AssignmentType)
  type: AssignmentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: Date;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
  })
  @IsNotEmpty()
  @IsEnum(AssignmentMode)
  mode: AssignmentMode;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  points?: number | null;
  @ApiProperty({
    enum: AssignmentStatus,
    enumName: 'AssignmentStatus',
  })
  @IsNotEmpty()
  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;
  @ApiProperty({
    type: 'boolean',
    default: false,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  allowResubmission?: boolean | null;
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
}
