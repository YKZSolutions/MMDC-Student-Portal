import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAssignmentDto {
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
    default: 100,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  points?: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  maxAttempts?: number | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    default: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDecimal()
  latePenalty?: Prisma.Decimal | null;
}
