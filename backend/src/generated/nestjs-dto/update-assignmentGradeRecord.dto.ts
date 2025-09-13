import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentGradeRecordDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  rawScore?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  finalScore?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  feedback?: string | null;
}
