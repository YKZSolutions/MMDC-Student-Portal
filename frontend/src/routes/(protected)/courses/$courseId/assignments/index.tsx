import { createFileRoute } from '@tanstack/react-router'
import AssignmentsPageStudentView from '@/pages/student/courses/$courseId/assignments'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssignmentsPageStudentView></AssignmentsPageStudentView>
}
