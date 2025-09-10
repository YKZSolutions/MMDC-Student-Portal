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
  CourseEnrollment,
  type CourseEnrollment as CourseEnrollmentAsType,
} from './courseEnrollment.entity';
import {
  CourseSection,
  type CourseSection as CourseSectionAsType,
} from './courseSection.entity';
import {
  Submission,
  type Submission as SubmissionAsType,
} from './submission.entity';
import {
  StudentProgress,
  type StudentProgress as StudentProgressAsType,
} from './studentProgress.entity';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

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
  courseEnrollment?: CourseEnrollmentAsType[];
  @ApiHideProperty()
  courseSections?: CourseSectionAsType[];
  @ApiHideProperty()
  submissions?: SubmissionAsType[];
  @ApiProperty({
    type: () => Submission,
    isArray: true,
    required: false,
  })
  gradedSubmissions?: SubmissionAsType[];
  @ApiHideProperty()
  moduleProgress?: StudentProgressAsType[];
  @ApiHideProperty()
  publishedModules?: ModuleAsType[];
  @ApiHideProperty()
  publishedSections?: ModuleSectionAsType[];
  @ApiHideProperty()
  publishedContents?: ModuleContentAsType[];
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
