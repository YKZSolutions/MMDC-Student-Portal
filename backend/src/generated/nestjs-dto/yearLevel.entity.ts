import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  StudentDetails,
  type StudentDetails as StudentDetailsAsType,
} from './studentDetails.entity';
import {
  CurriculumCourse,
  type CurriculumCourse as CurriculumCourseAsType,
} from './curriculumCourse.entity';
import {
  EnrollmentPeriod,
  type EnrollmentPeriod as EnrollmentPeriodAsType,
} from './enrollmentPeriod.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';

export class YearLevel {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  levelOrder: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiHideProperty()
  students?: StudentDetailsAsType[];
  @ApiHideProperty()
  curriculumCourses?: CurriculumCourseAsType[];
  @ApiHideProperty()
  enrollmentPeriods?: EnrollmentPeriodAsType[];
  @ApiHideProperty()
  courseOfferings?: CourseOfferingAsType[];
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
