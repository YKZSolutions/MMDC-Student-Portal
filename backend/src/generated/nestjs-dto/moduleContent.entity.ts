import { ContentType } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import { Lesson, type Lesson as LessonAsType } from './lesson.entity';
import {
  Assignment,
  type Assignment as AssignmentAsType,
} from './assignment.entity';
import { Quiz, type Quiz as QuizAsType } from './quiz.entity';
import {
  Discussion,
  type Discussion as DiscussionAsType,
} from './discussion.entity';
import { Video, type Video as VideoAsType } from './video.entity';
import {
  ExternalUrl,
  type ExternalUrl as ExternalUrlAsType,
} from './externalUrl.entity';
import {
  FileResource,
  type FileResource as FileResourceAsType,
} from './fileResource.entity';
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
    enum: ContentType,
    enumName: 'ContentType',
  })
  contentType: ContentType;
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
    type: () => Lesson,
    required: false,
    nullable: true,
  })
  lesson?: LessonAsType | null;
  @ApiProperty({
    type: () => Assignment,
    required: false,
    nullable: true,
  })
  assignment?: AssignmentAsType | null;
  @ApiProperty({
    type: () => Quiz,
    required: false,
    nullable: true,
  })
  quiz?: QuizAsType | null;
  @ApiProperty({
    type: () => Discussion,
    required: false,
    nullable: true,
  })
  discussion?: DiscussionAsType | null;
  @ApiProperty({
    type: () => Video,
    required: false,
    nullable: true,
  })
  video?: VideoAsType | null;
  @ApiProperty({
    type: () => ExternalUrl,
    required: false,
    nullable: true,
  })
  externalUrl?: ExternalUrlAsType | null;
  @ApiProperty({
    type: () => FileResource,
    required: false,
    nullable: true,
  })
  fileResource?: FileResourceAsType | null;
  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  studentProgress?: ContentProgressAsType[];
}
