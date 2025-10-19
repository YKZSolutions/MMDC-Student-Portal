import { ApiProperty } from '@nestjs/swagger';
import { GradeLetter, Prisma } from '@prisma/client';
import { IsDecimal, IsOptional } from 'class-validator';

export class UpdateTranscriptDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsDecimal()
  grade: Prisma.Decimal;

  @ApiProperty({
    enum: GradeLetter,
    required: false,
  })
  @IsOptional()
  gradeLetter?: GradeLetter;
}
