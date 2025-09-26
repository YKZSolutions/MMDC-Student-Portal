import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

export class Video {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  moduleContent?: ModuleContentAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
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
    nullable: true,
  })
  url: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  duration: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  transcript: string | null;
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
