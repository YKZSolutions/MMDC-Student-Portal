import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { zRole } from '@/integrations/api/client/zod.gen'
import { mergeCommonSearchSchema } from '@/integrations/zod/merge-common-schema'
import UsersPage from '@/pages/admin/users/users.admin'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const usersSearchSchema = mergeCommonSearchSchema({
  role: z.enum(zRole.options).optional(),
})

export type UsersSearchSchemaType = z.infer<typeof usersSearchSchema>

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
