import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  GradeRecord,
  type GradeRecord as GradeRecordAsType,
} from './gradeRecord.entity';

export class RubricScore {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  gradeRecord?: GradeRecordAsType;
  @ApiProperty({
    type: 'string',
  })
  gradeRecordId: string;
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
