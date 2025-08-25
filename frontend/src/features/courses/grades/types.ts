// --- Grade (applies to student or group) ---
import type {
  Submission,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'

/**
 * Represents a grade for an assignment or group submission.
 *
 * Properties:
 * - `id`: A unique identifier for the grade.
 * - `released`: Indicates whether the grade has been released to students.
 * - `assignmentId`: The ID of the assignment associated with the grade.
 * - `submissionId`: The ID of the specific submission attempt this grade is for.
 * - `studentId`: The ID of the student who submitted the assignment.
 * - `groupId`: The ID of the group who submitted the assignment.
 * - `groupMemberIds`: An array of IDs representing the members of the group who submitted the assignment.
 * - `score`: The grade score.
 * - `maxScore`: The maximum possible score for the assignment.
 * - `feedback`: Optional feedback provided by the teacher or mentor.
 * - `gradedBy`: The ID of the teacher or mentor who graded the assignment.
 * - `gradedAt`: The timestamp when the grade was graded.
 * - `updatedAt`: Optional timestamp for when the grade was last updated.
 */
export interface Grade {
  id: string
  released?: boolean;
  assignmentId: string
  submissionId?: string;         //Link to specific submission attempt
  studentId?: string             // if graded individually
  groupId?: string               // if graded as a group
  groupMemberIds?: string[]      // snapshot of members at grading
  score: number | null
  maxScore: number
  feedback?: string
  gradedBy: string               // teacher/mentor ID
  gradedAt: string
  updatedAt?: string
}

/**
 * Represents a student's grade for an assignment, including submission history.
 * For the gradebook view, includes a currentGrade for easy display.
 */
export interface StudentAssignmentGrade {
  assignmentId: string;
  assignmentTitle: string;
  points: number;
  dueDate: string;
  submissions: Submission[]; // All submission attempts
  currentGrade?: {           // Simplified current grade for display
    score: number;
    maxScore: number;
    feedback?: string;
    gradedAt?: string;
  };
}

/**
 * Represents a course gradebook for a student.
 * Includes assignments with current grades and submission history.
 */
export interface CourseGradebookForStudent {
  courseId: string
  studentId: string
  studentName: string
  assignments: StudentAssignmentGrade[]
  totalScore?: number
  totalMaxScore?: number
  gpaEquivalent?: number
}

// Mentor’s view: all students
export interface CourseGradebookForMentor {
  courseId: string
  assignments: {
    assignmentId: string
    assignmentTitle: string
    points?: number
    dueDate: string
    submissions: {
      studentId: string
      studentName: string
      submissionStatus: SubmissionStatus
      submissionTimestamp?: string
      grade?: {
        score: number
        maxScore: number
        feedback?: string
        gradedAt?: string;
      }
    }[]
  }[]
}