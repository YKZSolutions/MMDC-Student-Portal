import { createFileRoute } from '@tanstack/react-router'
import SubmissionsPageStudentView from '@/pages/student/courses/$courseId/submissions'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/submissions/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SubmissionsPageStudentView></SubmissionsPageStudentView>
}
