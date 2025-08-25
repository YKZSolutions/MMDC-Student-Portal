import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import UsersPage from '@/pages/admin/users/users.admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <UsersPage />,
      }}
    />
  )
}
