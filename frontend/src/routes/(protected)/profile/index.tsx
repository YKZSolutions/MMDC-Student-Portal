import { ErrorFallback } from '@/components/error-component'
import { Loader } from '@/components/loader-component'
import ProfilePage from '@/pages/shared/profile/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/profile/')({
  component: RouteComponent,
  pendingComponent: Loader,
  errorComponent: ErrorFallback,
})

function RouteComponent() {
  return <ProfilePage />
}
