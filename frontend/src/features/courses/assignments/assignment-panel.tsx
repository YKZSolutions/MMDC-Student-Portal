import { Stack } from '@mantine/core'
import type { AssignmentData } from '@/features/courses/types.ts'
import AssignmentCard from '@/features/courses/assignments/assignment-card.tsx'

const AssignmentPanel = ({assignments}: {assignments: AssignmentData[]})=>{
  return (
    <Stack gap={'md'}>
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

export default AssignmentPanel