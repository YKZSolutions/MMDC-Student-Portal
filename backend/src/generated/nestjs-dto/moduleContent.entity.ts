import { ContentType, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import { User, type User as UserAsType } from './user.entity';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import {
  Submission,
  type Submission as SubmissionAsType,
} from './submission.entity';
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
    type: 'string',
  })
  moduleId: string;
  @ApiHideProperty()
  module?: ModuleAsType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  moduleSectionId: string | null;
  @ApiHideProperty()
  moduleSection?: ModuleSectionAsType | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  order: number;
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
    enum: ContentType,
    enumName: 'ContentType',
  })
  contentType: ContentType;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
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
  toPublishAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  publishedBy: string | null;
  @ApiHideProperty()
  publishedByUser?: UserAsType | null;
  @ApiHideProperty()
  assignment?: AssignmentAsType | null;
  @ApiHideProperty()
  submissions?: SubmissionAsType[];
  @ApiHideProperty()
  studentProgress?: ContentProgressAsType[];
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
