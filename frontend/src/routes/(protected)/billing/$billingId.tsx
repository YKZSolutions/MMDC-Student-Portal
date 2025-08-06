import BillingIdPage from '@/pages/admin/billing/$billingId'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/$billingId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BillingIdPage />
}
