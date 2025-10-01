import type {
  AssignmentStatus,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'
import { isPastDueDate } from '@/utils/helpers.tsx'
import { Button } from '@mantine/core'
import { IconEye, IconSend } from '@tabler/icons-react'

type SubmissionButtonProps = {
  submissionStatus: SubmissionStatus
  dueDate: string
  assignmentStatus: AssignmentStatus
  isPreview?: boolean
  onClick: () => void
}

const SubmitButton = ({
  submissionStatus,
  assignmentStatus,
  dueDate,
  onClick,
  isPreview,
}: SubmissionButtonProps) => {
  const isPending = submissionStatus === 'pending'
  const isDraft = submissionStatus === 'draft'
  const isLate = isPending ? isPastDueDate(dueDate) : false
  const isMissed = assignmentStatus === 'closed' && isPending

  function getLabel() {
    if (isPreview) return 'Preview Action'
    if (isMissed) return 'You have missed this assignment'

    if (isLate) return 'Submit Late'
    if (isPending) return 'Submit'

    if (isDraft) return 'Finalize Draft'
    if (submissionStatus === 'graded') return 'View Grade'

    return 'View Submission'
  }

  return (
    <Button
      variant="filled"
      radius={'md'}
      leftSection={
        isPending || isDraft ? <IconSend size={16} /> : <IconEye size={16} />
      }
      size="xs"
      onClick={onClick}
      color={isLate ? submissionStatus : 'primary'}
      disabled={isMissed || isPreview}
    >
      {getLabel()}
    </Button>
  )
}

export default SubmitButton
