import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import AdminDashboard from '@/pages/admin/dashboard/dashboard.admin'
import StudentDashboard from '@/pages/student/dashboard/dashboard.student'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <StudentDashboard />,
        admin: <AdminDashboard />,
      }}
    />
  )
}
