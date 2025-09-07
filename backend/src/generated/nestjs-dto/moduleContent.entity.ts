import { ContentType, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import { User, type User as UserAsType } from './user.entity';
import {
  AssignmentBase,
  type AssignmentBase as AssignmentBaseAsType,
} from './assignmentBase.entity';
import {
  Submission,
  type Submission as SubmissionAsType,
} from './submission.entity';
import {
  StudentProgress,
  type StudentProgress as StudentProgressAsType,
} from './studentProgress.entity';

export class ModuleContent {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
  })
  subtitle: string;
  @ApiProperty({
    type: 'string',
  })
  moduleSectionId: string;
  @ApiProperty({
    type: () => ModuleSection,
    required: false,
  })
  moduleSection?: ModuleSectionAsType;
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
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: UserAsType | null;
  @ApiHideProperty()
  assignmentBase?: AssignmentBaseAsType | null;
  @ApiHideProperty()
  submissions?: SubmissionAsType[];
  @ApiHideProperty()
  studentProgress?: StudentProgressAsType[];
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
