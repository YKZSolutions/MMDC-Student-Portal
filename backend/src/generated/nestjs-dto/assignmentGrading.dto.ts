import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentGradingDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Object,
  })
  gradingSchema: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  weight: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  isCurved: boolean;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  curveSettings: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
