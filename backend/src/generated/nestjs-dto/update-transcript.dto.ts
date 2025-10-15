import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateTranscriptDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  grade?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  gradeLetter?: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  gradePoints?: Prisma.Decimal;
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
