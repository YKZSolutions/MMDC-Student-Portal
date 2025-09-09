import { createFileRoute } from '@tanstack/react-router'
import AssignmentPage from '@/pages/shared/courses/$courseCode/assignments/assignment-page.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssignmentPage />
}
