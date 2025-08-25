import { isPastDueDate } from '@/utils/helpers.ts'
import type { StudentAssignment } from '@/features/courses/assignments/types.ts'

export function useSubmissionDetails (assignment: StudentAssignment) {
  const { submissionStatus = '', dueDate = '', status = ''} = assignment || {}

  const isPending = submissionStatus === 'pending'
  const isDraft = submissionStatus === 'draft'
  const isLate= isPending ? isPastDueDate(dueDate) : false
  const isMissed = status === 'closed' && isPending

  const mappedStatus = isMissed ? 'missed' : isLate ? 'late' : isPending ? 'pending' : isDraft ? 'draft' : 'submitted'

  return {isPending, isDraft, isLate, isMissed, mappedStatus}
}