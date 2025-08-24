// --- Assignment base ---
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
 * - `open`: The assignment is available and accessible.
 * - `closed`: The assignment is no longer available, but it is not restricted.
 * - `locked`: The assignment is restricted and cannot be accessed.
 */
export type AssignmentStatus = 'open' | 'closed' | 'locked'

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
 * - `createdAt`: A timestamp that indicates when the assignment was created.
 * - `updatedAt`: An optional timestamp for when the assignment was last updated.
 * - `dueDate`: A required ISO 8601-compliant string representing the assignment's due date and time.
 * - `mode`: Indicates the submission or grading mode, defined by an {@link AssignmentMode} type.
 * - `points`: An optional field representing the maximum points available for the assignment.
 * - `attachments`: An optional array of strings, typically used to store URLs or paths to additional resources or files related to the assignment.
 * - `status`: Represents the current state of the assignment, as defined by an {@link AssignmentStatus} type.
 */
export interface Assignment {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt?: string
  dueDate: string // ISO string
  mode: AssignmentMode // determines submission/grade type
  points?: number // max points
  attachments?: string[]
  status: AssignmentStatus
}

/**
 * Represents the possible statuses for a student's submission.
 *
 * The `SubmissionStatus` type is used to define the status of a student's assignment submission.
 * It can be one of the following:
 * - `submitted`: The student has submitted the assignment.
 * - `pending`: The student has submitted the assignment but it is awaiting review.
 * - `late`: The student has submitted the assignment after the due date.
 * - `missed`: The student has not submitted the assignment before the due date.
 */
export type SubmissionStatus = 'submitted' | 'pending' | 'late' | 'missed'

/**
 * Represents the base structure for a student's or group's submission.
 *
 * The SubmissionBase interface is used to define the core properties of a student's or group's submission.
 *
 * Properties:
 * - `submissionStatus`: Indicates the status of the submission, defined by a {@link SubmissionStatus} type.
 * - `submissionLink`: An optional string representing the link to the student's submission.
 * - `submissionTimestamp`: An optional timestamp representing the time when the student submitted the assignment.
 * - `grade`: An optional {@link Grade} object representing the grade assigned to the student for the assignment.
 */
export interface Submission {
  submissionStatus: SubmissionStatus
  submissionLink?: string
  submissionTimestamp?: string
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
 * - `assignmentId`: The ID of the assignment associated with the submission.
 * - `grade`: An optional {@link Grade} object representing the grade assigned to the student for the assignment.
 */
export interface StudentAssignment extends Assignment, Submission {
  assignmentId: string
  grade?: Grade
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
 * - `groupName`: The name of the group that submitted the assignment.
 * - `submissionStatus`: The current status of the submission, defined by a {@link SubmissionStatus} type.
 * - `submittedAt`: An optional timestamp indicating when the assignment was submitted.
 * - `grade`: An optional number representing the grade received for the submission.
 * - `memberCount`: The number of members in the group at the time of submission.
 */
export interface GroupSubmissionSummary {
  groupId: string
  groupName: string
  submissionStatus: SubmissionStatus
  submittedAt?: string
  grade?: number
  memberCount: number
}

/**
 * Represents an assignment from a mentor's perspective, including submission summaries.
 * Extends the base properties provided by the {@link Assignment} interface.
 *
 * Properties:
 * - `submissions`: An array of submission summaries, which can be either individual
 *   {@link AssignmentSubmissionSummary} or group {@link GroupSubmissionSummary} submissions.
 */
export interface MentorAssignment extends Assignment {
  submissions: (AssignmentSubmissionSummary | GroupSubmissionSummary)[]
}
