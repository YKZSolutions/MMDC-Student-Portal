import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RubricScoreDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  criterionKey: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  label: string | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  maxPoints: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  score: Prisma.Decimal;
}
