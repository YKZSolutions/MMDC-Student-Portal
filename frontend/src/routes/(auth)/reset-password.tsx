import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPage from '@/pages/shared/reset-password-page.tsx'

export const Route = createFileRoute('/(auth)/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPasswordPage />
}
