import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import { Quiz, type Quiz as QuizAsType } from './quiz.entity';

export class GradingConfig {
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
  @ApiHideProperty()
  assignments?: AssignmentAsType[];
  @ApiProperty({
    type: () => Quiz,
    isArray: true,
    required: false,
  })
  quizzes?: QuizAsType[];
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
