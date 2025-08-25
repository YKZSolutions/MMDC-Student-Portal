import { Stack } from '@mantine/core'
import AssignmentCard from '@/features/courses/assignments/assignment-card.tsx'
import type {
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'

const AssignmentPanel = ({assignments}: {assignments: StudentAssignment[]})=>{
  return (
    <Stack gap={'md'}>
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

export default AssignmentPanel