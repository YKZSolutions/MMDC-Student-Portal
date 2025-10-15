import { GradeLetter, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsEnum, IsOptional } from 'class-validator';

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
    enum: GradeLetter,
    enumName: 'GradeLetter',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(GradeLetter)
  gradeLetter?: GradeLetter | null;
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
