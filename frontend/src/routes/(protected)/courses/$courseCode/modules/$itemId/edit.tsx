import { createFileRoute, useParams } from '@tanstack/react-router'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CMS } from '@/features/courses/cms/cms.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { courseCode, itemId } = useParams({ strict: false })
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS courseCode={courseCode} itemId={itemId} />,
      }}
    />
  )
}
