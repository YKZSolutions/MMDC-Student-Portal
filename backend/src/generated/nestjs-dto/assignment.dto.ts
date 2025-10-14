import { AssignmentMode, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: AssignmentMode,
    enumName: 'AssignmentMode',
    nullable: true,
  })
  mode: AssignmentMode | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  maxScore: Prisma.Decimal;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  weightPercentage: number;
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
