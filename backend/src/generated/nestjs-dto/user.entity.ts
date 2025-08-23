import { Role } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  UserAccount,
  type UserAccount as UserAccountAsType,
} from './userAccount.entity';
import {
  UserDetails,
  type UserDetails as UserDetailsAsType,
} from './userDetails.entity';
import {
  StudentDetails,
  type StudentDetails as StudentDetailsAsType,
} from './studentDetails.entity';
import {
  StaffDetails,
  type StaffDetails as StaffDetailsAsType,
} from './staffDetails.entity';
import { Bill, type Bill as BillAsType } from './bill.entity';
import {
  Notification,
  type Notification as NotificationAsType,
} from './notification.entity';
import {
  EnrolledCourse,
  type EnrolledCourse as EnrolledCourseAsType,
} from './enrolledCourse.entity';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';

export class User {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  userAccount?: UserAccountAsType | null;
  @ApiHideProperty()
  userDetails?: UserDetailsAsType | null;
  @ApiHideProperty()
  studentDetails?: StudentDetailsAsType | null;
  @ApiHideProperty()
  staffDetails?: StaffDetailsAsType | null;
  @ApiHideProperty()
  bills?: BillAsType[];
  @ApiHideProperty()
  notifications?: NotificationAsType[];
  @ApiHideProperty()
  enrolledCourses?: EnrolledCourseAsType[];
  @ApiHideProperty()
  courseSections?: CourseSectionAsType[];
  @ApiProperty({
    type: 'string',
  })
  firstName: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  middleName: string | null;
  @ApiProperty({
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
  })
  role: Role;
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
  disabledAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
