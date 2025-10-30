import CourseGrades from '@/pages/shared/lms/$lmsCode/grades'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/grades/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseGrades />
}
