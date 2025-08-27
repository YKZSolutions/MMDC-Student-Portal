import type {
  Assignment,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'

export function getChildTypeFromParentType(parentType?: string) {
  if (!parentType) return 'module'

  switch (parentType) {
    case 'module':
      return 'section'
    case 'section':
      return 'item'
    default:
      return 'module'
  }
}

export function isPastDueDate(date: string) {
  const today = new Date()
  const dueDate = new Date(date)
  return dueDate < today
}

// TODO: remove these if not needed, these are currently used for mocking dates
export function getFutureDate(daysToAdd: number) {
  return new Date(
    new Date().setDate(new Date().getDate() + daysToAdd),
  ).toISOString()
}

export function getPastDate(daysToSubtract: number) {
  return new Date(
    new Date().setDate(new Date().getDate() - daysToSubtract),
  ).toISOString()
}

export function getSubmissionStatus(
  assignment: Assignment | StudentAssignment | undefined,
) {
  if (!assignment) return undefined

  if ('submissionStatus' in assignment) {
    return assignment.submissionStatus
  }

  return undefined
}
