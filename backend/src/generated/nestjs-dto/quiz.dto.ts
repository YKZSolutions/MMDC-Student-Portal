import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class QuizDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  subtitle: string | null;
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  content: Prisma.JsonValue[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  timeLimit: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  maxAttempts: number | null;
  @ApiProperty({
    type: 'boolean',
    nullable: true,
  })
  allowLateSubmission: boolean | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  latePenalty: Prisma.Decimal | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dueDate: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  gracePeriodMinutes: number | null;
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  questions: Prisma.JsonValue[];
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
