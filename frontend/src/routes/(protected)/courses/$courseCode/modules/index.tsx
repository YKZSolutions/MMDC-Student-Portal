import { createFileRoute } from '@tanstack/react-router'
import CourseModulesPage from '@/pages/student/courses/$courseId/modules/course-modules.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'

export const Route = createFileRoute('/(protected)/courses/$courseCode/modules/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <CourseModulesPage />
}
