import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  EnrollmentPeriod,
  type EnrollmentPeriod as EnrollmentPeriodAsType,
} from './enrollmentPeriod.entity';
import {
  EnrolledCourses,
  type EnrolledCourses as EnrolledCoursesAsType,
} from './enrolledCourses.entity';

export class EnrollableCourses {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  courseId: string;
  @ApiHideProperty()
  course?: CourseAsType;
  @ApiProperty({
    type: 'string',
  })
  periodId: string;
  @ApiHideProperty()
  enrollmentPeriod?: EnrollmentPeriodAsType;
  @ApiProperty({
    type: () => EnrolledCourses,
    isArray: true,
    required: false,
  })
  enrolledCourses?: EnrolledCoursesAsType[];
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
