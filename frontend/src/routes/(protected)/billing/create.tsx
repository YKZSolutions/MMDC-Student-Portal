import CreateBillingPage from '@/pages/admin/billing/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateBillingPage />
}
