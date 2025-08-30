import { createFileRoute } from '@tanstack/react-router'
import CourseAssignments from '@/pages/shared/courses/$courseId/assignments/course-assignments.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseAssignments />
}
