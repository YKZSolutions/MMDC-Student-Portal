import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import ModulesCreateAdminPage from '@/pages/admin/lms/$lmsCode/modules/create'
import LMSContentEditPage from '@/pages/admin/lms/lms-content-view.page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsContentStateSearchSchema = z.object({
  id: z.uuidv4().optional(),
  view: z.enum(['preview']).optional(),
})

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/edit',
)({
  component: RouteComponent,
  validateSearch: lmsContentStateSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <LMSContentEditPage />,
        // admin: <ModulesCreateAdminPage />,
      }}
    />
  )
}
