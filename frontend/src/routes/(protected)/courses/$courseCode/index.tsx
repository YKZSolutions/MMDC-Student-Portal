import { createFileRoute } from '@tanstack/react-router'
import CourseOverview from '@/pages/shared/courses/$courseId/course-overview.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CourseOverview />
  )
}
