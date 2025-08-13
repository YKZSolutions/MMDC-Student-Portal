import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import EnrollmentStudentPage from '@/pages/student/enrollment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/enrollment/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <EnrollmentStudentPage />,
      }}
    />
  )
}
