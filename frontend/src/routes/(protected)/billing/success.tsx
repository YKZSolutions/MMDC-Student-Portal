import SuccessPage from '@/pages/shared/billing/success'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/success')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SuccessPage />
}
