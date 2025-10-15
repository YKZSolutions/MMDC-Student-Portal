import { ContentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import {
  ContentProgress,
  type ContentProgress as ContentProgressAsType,
} from './contentProgress.entity';

export class ModuleContent {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => ModuleSection,
    required: false,
  })
  moduleSection?: ModuleSectionAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleSectionId: string;
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
  })
  contentType: ContentType;
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
  })
  order: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  publishedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  unpublishedAt: Date | null;
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
    required: false,
    nullable: true,
  })
  assignment?: AssignmentAsType | null;
  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  studentProgress?: ContentProgressAsType[];
}
