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

type SubmissionButtonProps = {
    submissionStatus: SubmissionStatus
    onClick: () => void
}

const SubmitButton = ({submissionStatus, onClick}: SubmissionButtonProps) => {
    return (
        <Button
            variant="filled"
            leftSection={submissionStatus === 'submitted' ? <IconEye size={16} /> : <IconSend size={16} />}
            onClick={onClick}
            disabled={submissionStatus === 'missed'}
            color={submissionStatus === 'late' ? submissionStatus : 'primary'}
        >
            {(() => {
                switch (submissionStatus) {
                    case 'submitted':
                        return 'View Submission';
                    case 'pending':
                        return "Submit";
                    case 'late':
                        return "Submit Late";
                    case 'missed':
                        return "You missed this assignment";
                    default:
                        return "Submit";
                }
            })()}
        </Button>
    )
}

export default SubmitButton