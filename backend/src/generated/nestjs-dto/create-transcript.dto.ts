import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
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
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  gradeLetter: string;
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
