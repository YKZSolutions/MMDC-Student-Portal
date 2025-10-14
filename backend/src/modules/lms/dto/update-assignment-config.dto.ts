import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsDateString,
  IsDecimal,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class UpdateAssignmentConfigDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsOptional()
  @IsDecimal()
  maxScore?: Prisma.Decimal;

  @IsOptional()
  @IsPositive()
  maxAttempt?: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueAt?: Date;
}
