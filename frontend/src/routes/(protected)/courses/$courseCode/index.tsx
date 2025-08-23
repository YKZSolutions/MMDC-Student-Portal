import { createFileRoute } from '@tanstack/react-router'
import CourseOverview from '@/pages/student/courses/$courseId/course-overview.tsx'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'

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
