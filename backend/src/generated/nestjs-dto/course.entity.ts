import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Major, type Major as MajorAsType } from './major.entity';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  CurriculumCourse,
  type CurriculumCourse as CurriculumCourseAsType,
} from './curriculumCourse.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';

export class Course {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  majors?: MajorAsType[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  prereqs?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  prereqFor?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  coreqs?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  coreqFor?: Course[];
  @ApiHideProperty()
  modules?: ModuleAsType[];
  @ApiProperty({
    type: () => CurriculumCourse,
    isArray: true,
    required: false,
  })
  curriculumCourses?: CurriculumCourseAsType[];
  @ApiProperty({
    type: 'string',
  })
  courseCode: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  units: number;
  @ApiProperty({
    type: 'string',
  })
  type: string;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiHideProperty()
  courseOfferings?: CourseOfferingAsType[];
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
