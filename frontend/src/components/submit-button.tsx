import React from 'react'
import {
  IconCircle,
  IconCircleCheck,
  IconEye,
  IconLock,
  IconSend,
  IconUrgent,
} from '@tabler/icons-react'
import { Button } from '@mantine/core'
import type {
  AssignmentStatus,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'
import {isPastDueDate} from "@/utils/helpers.ts";

type SubmissionButtonProps = {
    submissionStatus: SubmissionStatus
    dueDate: string
    assignmentStatus: AssignmentStatus
    onClick: () => void
}

const SubmitButton = ({
                          submissionStatus,
                          assignmentStatus,
                          dueDate,
                          onClick
                      }: SubmissionButtonProps) => {
  const isPending = submissionStatus === 'pending'
  const isDraft = submissionStatus === 'draft'
  const isLate= isPending ? isPastDueDate(dueDate) : false
  const isMissed = assignmentStatus === 'closed' && isPending

    function getLabel() {
        if (isMissed) return 'You have missed this assignment'

        if (isLate) return 'Submit Late'
        if (isPending) return 'Submit'

        if (isDraft) return 'View Draft'
        if (submissionStatus === 'graded') return 'View Grade'

        return 'View Submission'
    }

    return (
        <Button
            variant="filled"
            leftSection={
                isPending || isDraft ?  <IconSend size={16} /> : <IconEye size={16} />
            }
            onClick={onClick}
            color={isLate ? submissionStatus : 'primary'}
            disabled={isMissed}
        >
            {getLabel()}
        </Button>
    )
}

export default SubmitButton