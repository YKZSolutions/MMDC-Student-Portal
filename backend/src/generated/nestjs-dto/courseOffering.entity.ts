import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  EnrollmentPeriod,
  type EnrollmentPeriod as EnrollmentPeriodAsType,
} from './enrollmentPeriod.entity';
import {
  EnrolledCourse,
  type EnrolledCourse as EnrolledCourseAsType,
} from './enrolledCourse.entity';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';

export class CourseOffering {
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
    type: () => EnrolledCourse,
    isArray: true,
    required: false,
  })
  enrolledCourses?: EnrolledCourseAsType[];
  @ApiProperty({
    type: () => CourseSection,
    isArray: true,
    required: false,
  })
  courseSections?: CourseSectionAsType[];
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
