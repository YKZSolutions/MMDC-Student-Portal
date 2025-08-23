import { createFileRoute } from '@tanstack/react-router'
import CourseModules from '@/pages/shared/courses/$courseId/modules/course-modules.tsx'

export const Route = createFileRoute('/(protected)/courses/$courseCode/modules/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <CourseModules />
}
