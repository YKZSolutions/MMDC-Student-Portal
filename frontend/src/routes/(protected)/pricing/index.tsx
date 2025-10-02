import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import PricingPage from '@/pages/admin/pricing'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const pricingStateSearchSchema = z.object({
  createGroup: z.boolean().optional(),
  updateGroup: z.uuidv4().optional(),
  createFee: z.boolean().optional(),
  updateFee: z.uuidv4().optional(),
})

export type PricingStateSearch = z.infer<typeof pricingStateSearchSchema>

export const Route = createFileRoute('/(protected)/pricing/')({
  component: RouteComponent,
  loader: Loader,
  validateSearch: pricingStateSearchSchema,
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
