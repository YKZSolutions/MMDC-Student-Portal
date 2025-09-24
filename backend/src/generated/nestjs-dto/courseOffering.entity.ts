import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Course, type Course as CourseAsType } from './course.entity';
import {
  EnrollmentPeriod,
  type EnrollmentPeriod as EnrollmentPeriodAsType,
} from './enrollmentPeriod.entity';
import {
  CourseEnrollment,
  type CourseEnrollment as CourseEnrollmentAsType,
} from './courseEnrollment.entity';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  Appointment,
  type Appointment as AppointmentAsType,
} from './appointment.entity';

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
  @ApiHideProperty()
  courseEnrollments?: CourseEnrollmentAsType[];
  @ApiHideProperty()
  courseSections?: CourseSectionAsType[];
  @ApiHideProperty()
  modules?: ModuleAsType[];
  @ApiProperty({
    type: () => Appointment,
    isArray: true,
    required: false,
  })
  appointments?: AppointmentAsType[];
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
