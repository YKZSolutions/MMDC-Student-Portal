import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';
import { Module, type Module as ModuleAsType } from './module.entity';

export class SectionModule {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => CourseSection,
    required: false,
  })
  courseSection?: CourseSectionAsType;
  @ApiProperty({
    type: 'string',
  })
  courseSectionId: string;
  @ApiProperty({
    type: () => Module,
    required: false,
  })
  module?: ModuleAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleId: string;
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
  toPublishAt: Date | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  classMeetings: Prisma.JsonValue | null;
}
