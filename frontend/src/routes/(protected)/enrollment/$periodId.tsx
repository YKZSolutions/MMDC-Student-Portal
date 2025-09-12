import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import EnrollmentPeriodIdPage from '@/pages/admin/enrollment/$periodId'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/enrollment/$periodId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <EnrollmentPeriodIdPage />,
      }}
    />
  )
}
