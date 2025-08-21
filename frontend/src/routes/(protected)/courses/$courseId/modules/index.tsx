import { createFileRoute } from '@tanstack/react-router'
import CourseModulesPage from '@/pages/student/courses/$courseId/modules'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'

export const Route = createFileRoute('/(protected)/courses/$courseId/modules/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return <RoleComponentManager
    currentRole={authUser.role}
    roleRender={{
      student: <CourseModulesPage />,
    }}
  />
}
