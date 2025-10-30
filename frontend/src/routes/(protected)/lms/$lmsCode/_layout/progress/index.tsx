import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import LMSProgressPage from '@/pages/admin/lms/progress/lms-progress.page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/progress/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    authUser: { role },
  } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={role}
      roleRender={{
        admin: <LMSProgressPage />,
      }}
    />
  )
}
