import RedirectPage from '@/pages/shared/billing/redirect'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing/redirect')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RedirectPage />
}
