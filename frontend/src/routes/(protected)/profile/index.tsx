import { ErrorFallback } from '@/components/error-component'
import { Loader } from '@/components/loader-component'
import { usersControllerGetMeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import ProfilePage from '@/pages/shared/profile/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/profile/')({
  component: RouteComponent,
  pendingComponent: Loader,
  errorComponent: ErrorFallback,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(usersControllerGetMeOptions())
  },
})

function RouteComponent() {
  return <ProfilePage />
}
