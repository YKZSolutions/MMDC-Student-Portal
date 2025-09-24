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
  })
  content: Prisma.JsonValue;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  timeLimit: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxAttempts: number;
  @ApiProperty({
    type: 'boolean',
  })
  allowLateSubmission: boolean;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  latePenalty: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dueDate: Date | null;
  @ApiProperty({
    type: () => Object,
  })
  questions: Prisma.JsonValue;
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
