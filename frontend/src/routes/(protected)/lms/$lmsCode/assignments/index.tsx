import AssignmentPage from '@/pages/shared/lms/$lmsCode/assignments'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssignmentPage />
}
