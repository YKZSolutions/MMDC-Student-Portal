import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

export class Lesson {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiProperty({
    type: () => ModuleContent,
    required: false,
  })
  moduleContent?: ModuleContentAsType;
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
    nullable: true,
  })
  content: Prisma.JsonValue | null;
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
