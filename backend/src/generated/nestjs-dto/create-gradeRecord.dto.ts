import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGradeRecordDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  rawScore: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  finalScore: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  grade: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  feedback?: string | null;
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  rubricScores: Prisma.InputJsonValue[];
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  questionScores: Prisma.InputJsonValue[];
}
