import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Program, type Program as ProgramAsType } from './program.entity';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  Curriculum,
  type Curriculum as CurriculumAsType,
} from './curriculum.entity';

export class Major {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  programId: string;
  @ApiHideProperty()
  program?: ProgramAsType;
  @ApiHideProperty()
  courses?: CourseAsType[];
  @ApiHideProperty()
  curriculums?: CurriculumAsType[];
  @ApiProperty({
    type: 'string',
  })
  majorCode: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
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
