import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ModulesItemEditPage from '@/pages/admin/courses/$courseCode/modules/$itemId/edit'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <ModulesItemEditPage />,
      }}
    />
  )
}
