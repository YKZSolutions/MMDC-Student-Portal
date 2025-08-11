import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { usersControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import UsersPage from '@/pages/admin/users/users.admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/users/')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(usersControllerFindAllOptions())
  },
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
