import AssignmentPage from '@/pages/shared/courses/$courseCode/assignments'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssignmentPage />
}
