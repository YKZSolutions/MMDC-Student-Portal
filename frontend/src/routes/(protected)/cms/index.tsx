import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CMS } from '@/features/courses/cms/cms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/cms/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS viewMode={'full'} />,
      }}
    />
  )
}
