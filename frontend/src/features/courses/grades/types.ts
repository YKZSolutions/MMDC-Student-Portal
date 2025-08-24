// --- Grade (applies to student or group) ---
/**
 * Represents a grade for an assignment or group submission.
 *
 * Properties:
 * - `id`: A unique identifier for the grade.
 * - `assignmentId`: The ID of the assignment associated with the grade.
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
  assignmentId: string
  studentId?: string             // if graded individually
  groupId?: string               // if graded as a group
  groupMemberIds?: string[]      // snapshot of members at grading
  score: number
  maxScore: number
  feedback?: string
  gradedBy: string               // teacher/mentor ID
  gradedAt: string
  updatedAt?: string
}