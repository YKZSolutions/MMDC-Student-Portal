import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ModulesCreateAdminPage from '@/pages/admin/lms/$lmsCode/modules/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <ModulesCreateAdminPage />,
      }}
    />
  )
}
