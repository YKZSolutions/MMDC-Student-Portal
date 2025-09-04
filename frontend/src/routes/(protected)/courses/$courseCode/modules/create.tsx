import { createFileRoute, useParams } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { CMS } from '@/features/courses/cms/cms.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { courseCode } = useParams({ strict: false })
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS courseCode={courseCode} />,
      }}
    />
  )
}
