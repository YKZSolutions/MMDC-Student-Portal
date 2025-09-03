import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { CMS } from '@/features/courses/cms/cms'

export const Route = createFileRoute('/(protected)/cms/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS />,
      }}
    />
  )
}
