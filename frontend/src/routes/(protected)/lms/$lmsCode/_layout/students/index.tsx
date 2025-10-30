import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import LMSStudentsPage from '@/pages/admin/lms/students/lms-students.page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/students/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    authUser: { role },
  } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={role}
      roleRender={{
        admin: <LMSStudentsPage />,
      }}
    />
  )
}
