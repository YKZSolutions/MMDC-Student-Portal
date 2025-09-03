import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import CreateEnrollmentPage from '@/pages/admin/enrollment/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/enrollment/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CreateEnrollmentPage />,
      }}
    />
  )
}
