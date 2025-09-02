import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import PricingPage from '@/pages/admin/pricing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/pricing/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <PricingPage />,
      }}
    />
  )
}
