import { createFileRoute } from '@tanstack/react-router'
import CourseOverview from '@/pages/shared/courses/$courseCode/overview/course-overview.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/overview/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseOverview />
}
