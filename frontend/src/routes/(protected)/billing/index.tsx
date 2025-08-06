import BillingPage from '@/pages/admin/billing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BillingPage />
}
