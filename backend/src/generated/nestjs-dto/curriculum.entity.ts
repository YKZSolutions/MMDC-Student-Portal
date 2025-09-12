import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Major, type Major as MajorAsType } from './major.entity';
import {
  CurriculumCourse,
  type CurriculumCourse as CurriculumCourseAsType,
} from './curriculumCourse.entity';

export class Curriculum {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  majorId: string;
  @ApiHideProperty()
  major?: MajorAsType;
  @ApiHideProperty()
  courses?: CurriculumCourseAsType[];
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  icon: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
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
