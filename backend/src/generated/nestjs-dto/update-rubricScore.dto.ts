import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateRubricScoreDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  criterionKey?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  label?: string | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  maxPoints?: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  score?: Prisma.Decimal;
}
