import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import AdminCourseDashboardPage from '@/pages/admin/courses'
import MentorCourseDashboardPage from '@/pages/mentor/courses'
import StudentCourseDashboardPage from '@/pages/student/courses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <StudentCourseDashboardPage />,
        mentor: <MentorCourseDashboardPage />,
        admin: <AdminCourseDashboardPage />,
      }}
    />
  )
}
