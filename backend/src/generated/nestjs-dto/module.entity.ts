import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import {
  SectionModule,
  type SectionModule as SectionModuleAsType,
} from './sectionModule.entity';
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

export class Module {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiHideProperty()
  course?: CourseAsType;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType;
  @ApiProperty({
    type: 'string',
  })
  courseOfferingId: string;
  @ApiHideProperty()
  sectionModules?: SectionModuleAsType[];
  @ApiHideProperty()
  moduleSections?: ModuleSectionAsType[];
  @ApiHideProperty()
  moduleContents?: ModuleContentAsType[];
  @ApiHideProperty()
  progresses?: ContentProgressAsType[];
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
}
