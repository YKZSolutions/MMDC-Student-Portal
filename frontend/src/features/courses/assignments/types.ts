import type { Grade } from '@/features/courses/grades/types.ts'

/**
 * Represents the possible modes for an assignment.
 *
 * The `AssignmentMode` type is used to define the submission or grading mode of an assignment.
 * - It can be either `individual` or `group`.
 */
export type AssignmentMode = 'individual' | 'group'

/**
 * Represents the possible statuses for an assignment.
 *
 * The `AssignmentStatus` type indicates the current state of an assignment using one of the following string values:
 * - `open`: The assignment accepts submissions and is available for grading.
 * - `closed`: The assignment is closed and submissions are no longer accepted.
 */
export type AssignmentStatus = 'open' | 'closed'

export type AssignmentType = 'assignment' | 'draft' | 'milestone' | 'other'

/**
 * Represents the base structure of an assignment entity.
 *
 * The AssignmentBase interface is used to define the core properties of an assignment,
 * including metadata, deadlines, and configuration fields essential for managing an assignment.
 *
 * Properties:
 * - `id`: A unique identifier for the assignment.
 * - `title`: The title or name of the assignment.
 * - `description`: A brief description of the assignment's purpose or details.
 * - `dueDate`: A required ISO 8601-compliant string representing the assignment's due date and time.
 * - `mode`: Indicates the submission or grading mode, defined by an {@link AssignmentMode} type.
 * - `points`: An optional field representing the maximum points available for the assignment.
 * - `status`: Represents the current state of the assignment, as defined by an {@link AssignmentStatus} type.
 * - `rubricId`: An optional string representing the ID of the rubric associated with the assignment.
 * - `allowResubmission`: A boolean indicating whether resubmissions are allowed for the assignment.
 * - `maxAttempts`: An optional integer representing the maximum number of attempts allowed for the assignment.
 * - `allowLateSubmission`: A boolean indicating whether late submissions are allowed for the assignment.
 */
export interface Assignment {
  id: string
  title: string
  type: AssignmentType
  description: string
  dueDate: string // ISO string
  mode: AssignmentMode
  points?: number // max points
  status: AssignmentStatus
  rubricId?: string
  allowResubmission?: boolean
  maxAttempts?: number
  allowLateSubmission?: boolean
}

/**
 * Represents the possible statuses for a student's submission.
 *
 * The `SubmissionStatus` type is used to define the status of a student's assignment submission.
 * It can be one of the following:
 * - `pending`: Waiting for submission.
 * - `draft`: The submission is submitted in a draft state, work only seen by students.
 * - `submitted`: The submission is marked ready for feedback and review.
 * - `ready-for-grading`: The submission is ready for grading.
 * - `graded`: The submission has been graded and is available for viewing.
 */
export type SubmissionStatus =
  | 'pending'
  | 'draft'
  | 'submitted'
  | 'ready-for-grading'
  | 'graded'

/**
 * Represents the base structure for a student's or group's submission.
 *
 * The SubmissionBase interface is used to define the core properties of a student's or group's submission.
 *
 * Properties:
 * - `submissionStatus`: Indicates the status of the submission, defined by a {@link SubmissionStatus} type.
 * - `submissionLink`: An optional string representing the link to the student's submission.
 * - `submissionTimestamp`: An optional timestamp representing the time when the student submitted the assignment.
 * - `attemptNumber`: An optional integer representing the number of attempts made by the student.
 * - `isLate`: A boolean indicating whether the student is late for the assignment.
 * - `lateDays`: An optional integer representing the number of late days remaining for the assignment.
 * - `grade`: An optional {@link Grade} object representing the grade assigned to the student for the assignment.
 */
export interface Submission {
  submissionStatus: SubmissionStatus
  submissionLink?: string
  submissionTimestamp?: string
  attemptNumber?: number
  isLate?: boolean
  lateDays?: number
  grade?: Grade
}

/**
 * Represents the submission details from a student for a specific assignment.
 * Extends the base properties provided by the {@link Submission} interface.
 *
 * Properties:
 * - `id`: A unique identifier for the submission.
 * - `assignmentId`: The ID of the assignment associated with the submission.
 * - `studentId`: The ID of the student who submitted the assignment.
 */
export interface StudentSubmission extends Submission {
  id: string
  assignmentId: string
  studentId: string
}

/**
 * Represents the submission details from a group for a specific assignment.
 * Extends the base properties provided by the {@link Submission} interface.
 *
 * Properties:
 * - `id`: A unique identifier for the submission.
 * - `assignmentId`: The ID of the assignment associated with the submission.
 * - `groupId`: The ID of the group who submitted the assignment.
 * - `memberIds`: An array of IDs representing the members of the group who submitted the assignment.
 */
export interface GroupSubmission extends Submission {
  id: string
  assignmentId: string
  groupId: string
  memberIds: string[] // snapshot of members when submitted
}

/**
 * Represents a student's assignment that includes information about the assignment,
 * its submission details, and optional grade information. This interface extends common
 * properties from {@link Assignment} and {@link Submission} to consolidate assignment-specific
 * and submission-related data.
 *
 * Properties:
 * - `submissionId`: An optional string representing the ID of the submission.
 * - `groupId`: An optional string representing the ID of the group associated with the assignment.
 * - `groupName`: An optional string representing the name of the group associated with the assignment.
 *
 */
export interface StudentAssignment extends Assignment, Submission {
  submissionId?: string
  groupId?: string
  groupName?: string
}

/**
 * Represents a summary of an individual student's assignment submission.
 *
 * Properties:
 * - `studentId`: The ID of the student who submitted the assignment.
 * - `studentName`: The name of the student who submitted the assignment.
 * - `submissionStatus`: The current status of the submission, defined by a {@link SubmissionStatus} type.
 * - `submittedAt`: An optional timestamp indicating when the assignment was submitted.
 * - `grade`: An optional number representing the grade received for the submission.
 */
export interface AssignmentSubmissionSummary {
  studentId: string
  studentName: string
  submissionStatus: SubmissionStatus
  submittedAt?: string
  grade?: number
}

/**
 * Represents a summary of a group's assignment submission.
 *
 * Properties:
 * - `groupId`: The ID of the group that submitted the assignment.
 * - `members`: An array of IDs representing the members of the group who submitted the assignment.
 * - `submissionStatus`: The current status of the submission, defined by a {@link SubmissionStatus} type.
 * - `submittedAt`: An optional timestamp indicating when the assignment was submitted.
 * - `grade`: An optional number representing the grade received for the submission.
 */
export interface GroupSubmissionSummary {
  groupId: string
  members: string[]
  submissionStatus: SubmissionStatus
  submittedAt?: string
  grade?: number
}

/**
 * Represents a report of an assignment's submissions, including both individual and group submissions.
 * Extends the base properties provided by the {@link Assignment} interface.
 *
 * Properties:
 * - `submissions`: An array of submission summaries, which can be either individual
 *   {@link AssignmentSubmissionSummary} or group {@link GroupSubmissionSummary} submissions.
 */
export interface AssignmentSubmissionReport extends Assignment {
  submissions: (AssignmentSubmissionSummary | GroupSubmissionSummary)[]
}
