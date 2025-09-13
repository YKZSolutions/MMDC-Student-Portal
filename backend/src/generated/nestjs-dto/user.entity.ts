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
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';
import {
  AssignmentGradeRecord,
  type AssignmentGradeRecord as AssignmentGradeRecordAsType,
} from './assignmentGradeRecord.entity';
import {
  QuizSubmission,
  type QuizSubmission as QuizSubmissionAsType,
} from './quizSubmission.entity';
import {
  DiscussionPost,
  type DiscussionPost as DiscussionPostAsType,
} from './discussionPost.entity';
import {
  ContentProgress,
  type ContentProgress as ContentProgressAsType,
} from './contentProgress.entity';

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
  submittedAssignments?: AssignmentSubmissionAsType[];
  @ApiHideProperty()
  grades?: AssignmentGradeRecordAsType[];
  @ApiHideProperty()
  gradedSubmissions?: AssignmentGradeRecordAsType[];
  @ApiHideProperty()
  quizAttempts?: QuizSubmissionAsType[];
  @ApiHideProperty()
  postedDiscussions?: DiscussionPostAsType[];
  @ApiHideProperty()
  moduleProgress?: ContentProgressAsType[];
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
