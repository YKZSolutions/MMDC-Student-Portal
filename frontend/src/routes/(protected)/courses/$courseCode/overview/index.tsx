import CourseOverview from '@/pages/shared/courses/$courseCode/overview'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/overview/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseOverview />
}
