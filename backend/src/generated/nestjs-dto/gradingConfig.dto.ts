import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GradingConfigDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  weight: Prisma.Decimal | null;
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
    type: () => Object,
    isArray: true,
  })
  rubricSchema: Prisma.JsonValue[];
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  questionRules: Prisma.JsonValue[];
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
