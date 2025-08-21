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

const SubmissionButton = ({status, onClick}: {status: 'completed' | 'pending' | 'late' | 'locked', onClick: () => void}) => {
  return (
    <Button
      variant="filled"
      leftSection={status === 'completed' ? <IconEye size={16} /> : <IconSend size={16} />}
      onClick={onClick}
      disabled={status === 'locked'}
      color={status === 'late' ? status : 'primary'}
    >
      {(() => {
        switch (status) {
          case 'completed':
            return 'View Submission';
          case 'pending':
            return "Submit";
          case 'late':
            return "Submit Late";
          case 'locked':
            return "Locked";
          default:
            return "Submit";
        }
      })()}
    </Button>
  )
}

export default SubmissionButton