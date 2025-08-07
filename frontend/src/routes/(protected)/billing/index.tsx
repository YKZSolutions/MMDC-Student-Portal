import BillingPage from '@/pages/shared/billing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BillingPage />
}
