import AssignmentPage from '@/pages/shared/lms/$lmsCode/assignments'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsAssignmentStateSearchSchema = z.object({
  view: z.uuidv4().optional(),
})

export const Route = createFileRoute('/(protected)/lms/$lmsCode/assignments/')({
  component: RouteComponent,
  validateSearch: lmsAssignmentStateSearchSchema,
})

function RouteComponent() {
  return <AssignmentPage />
}
