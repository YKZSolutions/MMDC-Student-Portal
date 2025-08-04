import { createFileRoute } from '@tanstack/react-router'
import UpdatePasswordPage from '@/pages/shared/update-password-page.tsx'

export const Route = createFileRoute('/(auth)/update-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UpdatePasswordPage />
}
