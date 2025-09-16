import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import {
  ContentProgress,
  type ContentProgress as ContentProgressAsType,
} from './contentProgress.entity';
import { Group, type Group as GroupAsType } from './group.entity';

export class Module {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiHideProperty()
  course?: CourseAsType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  courseOfferingId: string | null;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType | null;
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
  @ApiHideProperty()
  moduleSections?: ModuleSectionAsType[];
  @ApiHideProperty()
  moduleContents?: ModuleContentAsType[];
  @ApiHideProperty()
  progresses?: ContentProgressAsType[];
  @ApiHideProperty()
  groups?: GroupAsType[];
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
