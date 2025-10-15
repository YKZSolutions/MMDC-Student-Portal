import { GradeLetter, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateTranscriptDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  grade: Prisma.Decimal;
  @ApiProperty({
    enum: GradeLetter,
    enumName: 'GradeLetter',
  })
  @IsNotEmpty()
  @IsEnum(GradeLetter)
  gradeLetter: GradeLetter;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  gradePoints: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  deletedAt?: Date | null;
}
