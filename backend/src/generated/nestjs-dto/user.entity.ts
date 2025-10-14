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
  GradeRecord,
  type GradeRecord as GradeRecordAsType,
} from './gradeRecord.entity';
import {
  ContentProgress,
  type ContentProgress as ContentProgressAsType,
} from './contentProgress.entity';
import {
  GroupMember,
  type GroupMember as GroupMemberAsType,
} from './groupMember.entity';
import {
  Appointment,
  type Appointment as AppointmentAsType,
} from './appointment.entity';
import {
  NotificationReceipt,
  type NotificationReceipt as NotificationReceiptAsType,
} from './notificationReceipt.entity';

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
  courseEnrollment?: CourseEnrollmentAsType[];
  @ApiHideProperty()
  mentorSections?: CourseSectionAsType[];
  @ApiHideProperty()
  submittedAssignments?: AssignmentSubmissionAsType[];
  @ApiHideProperty()
  grades?: GradeRecordAsType[];
  @ApiHideProperty()
  moduleProgress?: ContentProgressAsType[];
  @ApiHideProperty()
  groups?: GroupMemberAsType[];
  @ApiHideProperty()
  appointmentStudents?: AppointmentAsType[];
  @ApiHideProperty()
  appointmentMentors?: AppointmentAsType[];
  @ApiHideProperty()
  notifications?: NotificationReceiptAsType[];
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
