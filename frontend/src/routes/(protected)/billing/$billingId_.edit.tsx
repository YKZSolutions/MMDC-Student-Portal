import EditBillingPage from '@/pages/admin/billing/$billingId_.edit'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/$billingId_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditBillingPage />
}
