import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CMS } from '@/features/courses/cms/cms.tsx'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/cms/$courseCode/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { courseCode } = useParams({ strict: false })
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CMS viewMode={'full'} courseCode={courseCode} />,
      }}
    />
  )
}
