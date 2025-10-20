import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { commonSearchSchema } from '@/features/validation/common-search.schema'
import { zRole } from '@/integrations/api/client/zod.gen'
import UsersPage from '@/pages/admin/users/users.admin'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const usersSearchSchema = z.object({
  ...commonSearchSchema.shape,
  role: z.enum(zRole.options).optional(),
})

export const Route = createFileRoute('/(protected)/users/')({
  component: RouteComponent,
  validateSearch: usersSearchSchema,
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
