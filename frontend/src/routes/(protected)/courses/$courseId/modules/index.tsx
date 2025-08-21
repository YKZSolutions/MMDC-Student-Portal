import { createFileRoute } from '@tanstack/react-router'
import CourseModulesPage from '@/pages/student/courses/$courseId/modules'

export const Route = createFileRoute('/(protected)/courses/$courseId/modules/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <CourseModulesPage/>
}
