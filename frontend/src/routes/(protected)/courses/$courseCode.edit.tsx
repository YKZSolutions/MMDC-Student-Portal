import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { CMS } from '@/features/courses/cms/cms.tsx'

export const Route = createFileRoute('/(protected)/courses/$courseCode/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  if (!authUser) {
    return null //TODO: or a loader / skeleton
  }

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS />,
      }}
    />
  )
}
