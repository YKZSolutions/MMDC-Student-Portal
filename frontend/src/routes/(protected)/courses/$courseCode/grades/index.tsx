import { createFileRoute } from '@tanstack/react-router'
import CourseGrades from '@/pages/shared/courses/$courseCode/grades/course-grades.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/grades/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseGrades />
}
