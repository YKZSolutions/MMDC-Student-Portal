import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRubricScoreDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  criterionKey: string;
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
  })
  @IsNotEmpty()
  @IsDecimal()
  maxPoints: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  score: Prisma.Decimal;
}
