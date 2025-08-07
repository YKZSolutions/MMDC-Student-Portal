import BillingIdPage from '@/pages/shared/billing/$billingId'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/$billingId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BillingIdPage />
}
