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
    const isLate= isPending ? isPastDueDate(dueDate) : false
    let isMissed = false

    function getLabel() {
        if (assignmentStatus === 'closed' && isPending) {
            isMissed = true
            return 'You have missed this assignment'
        }

        if (isLate) return 'Submit Late'
        if (isPending) return 'Submit'

        if (submissionStatus === 'draft') return 'View Draft'
        if (submissionStatus === 'graded') return 'View Grade'

        return 'View Submission'
    }

    return (
        <Button
            variant="filled"
            leftSection={
                submissionStatus ? <IconEye size={16} /> : <IconSend size={16} />
            }
            onClick={onClick}
            disabled={isMissed}
            color={isLate ? submissionStatus : 'primary'}
        >
            {getLabel()}
        </Button>
    )
}

export default SubmitButton