import CourseOverview from '@/pages/shared/lms/$lmsCode/overview'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/overview/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseOverview />
}
