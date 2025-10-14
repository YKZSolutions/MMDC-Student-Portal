import { ApiProperty } from '@nestjs/swagger';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';

export class RubricTemplate {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  tags: string[];
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  criteriaJson: PrismaJson.RubricCriterion | null;
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
  @ApiProperty({
    type: () => Assignment,
    isArray: true,
    required: false,
  })
  assignments?: AssignmentAsType[];
}
