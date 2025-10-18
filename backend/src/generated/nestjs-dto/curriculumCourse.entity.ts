import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Curriculum,
  type Curriculum as CurriculumAsType,
} from './curriculum.entity';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  YearLevel,
  type YearLevel as YearLevelAsType,
} from './yearLevel.entity';

export class CurriculumCourse {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  curriculum?: CurriculumAsType;
  @ApiProperty({
    type: 'string',
  })
  curriculumId: string;
  @ApiHideProperty()
  course?: CourseAsType;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiHideProperty()
  yearLevel?: YearLevelAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  yearLevelId: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  order: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  semester: number;
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
