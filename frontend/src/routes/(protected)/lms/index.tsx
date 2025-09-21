import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import AdminCourseDashboardPage from '@/pages/admin/lms'
import MentorCourseDashboardPage from '@/pages/mentor/lms'
import StudentCourseDashboardPage from '@/pages/student/lms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/')({
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
