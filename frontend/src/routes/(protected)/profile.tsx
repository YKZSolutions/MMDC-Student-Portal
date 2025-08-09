import { ErrorFallback } from '@/components/ErrorComponent'
import { Loader } from '@/components/Loader'
import ProfilePage from '@/pages/shared/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/profile')({
  component: RouteComponent,
  pendingComponent: Loader,
  errorComponent: ErrorFallback,
})

function RouteComponent() {
  return <ProfilePage />
}
