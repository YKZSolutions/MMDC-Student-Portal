import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ModulesItemCreatePage from '@/pages/admin/courses/$courseCode/modules/$itemId/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <ModulesItemCreatePage />,
      }}
    />
  )
}
