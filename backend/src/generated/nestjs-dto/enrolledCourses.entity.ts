import { EnrolledCourseStatus } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  EnrollableCourses,
  type EnrollableCourses as EnrollableCoursesAsType,
} from './enrollableCourses.entity';
import { User, type User as UserAsType } from './user.entity';

export class EnrolledCourses {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  enrollableId: string;
  @ApiHideProperty()
  enrollable?: EnrollableCoursesAsType;
  @ApiProperty({
    enum: EnrolledCourseStatus,
    enumName: 'EnrolledCourseStatus',
  })
  status: EnrolledCourseStatus;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiHideProperty()
  user?: UserAsType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  completedAt: Date;
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
