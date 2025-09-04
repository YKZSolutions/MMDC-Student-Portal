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
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAssignmentBaseDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  rubric?: Prisma.InputJsonValue;
  @ApiProperty({
    enum: AssignmentType,
    enumName: 'AssignmentType',
    required: false,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
    required: false,
  })
  @IsOptional()
  @IsEnum(AssignmentMode)
  mode?: AssignmentMode;
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
    required: false,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
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
