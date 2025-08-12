import { createFileRoute } from '@tanstack/react-router'
import UpdatePasswordPage from '@/pages/shared/auth/update-password-page'

export const Route = createFileRoute('/(auth)/update-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UpdatePasswordPage />
}
