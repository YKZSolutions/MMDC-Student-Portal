import { CourseEnrollmentStatus } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';
import { User, type User as UserAsType } from './user.entity';

export class CourseEnrollment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType;
  @ApiProperty({
    type: 'string',
  })
  courseOfferingId: string;
  @ApiHideProperty()
  courseSection?: CourseSectionAsType;
  @ApiProperty({
    type: 'string',
  })
  courseSectionId: string;
  @ApiHideProperty()
  user?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiProperty({
    enum: CourseEnrollmentStatus,
    enumName: 'CourseEnrollmentStatus',
  })
  status: CourseEnrollmentStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
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
