import CourseGrades from '@/pages/shared/courses/$courseCode/grades'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/grades/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseGrades />
}
