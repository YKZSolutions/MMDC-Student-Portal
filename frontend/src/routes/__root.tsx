import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'

import { client } from '@/integrations/api/client/client.gen'
import type { QueryClient } from '@tanstack/react-query'
import { Loader } from '@/components/loader-component'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  ),
  beforeLoad: () => {
    client.setConfig({
      baseUrl: import.meta.env.VITE_API_URL,
    })
  },
  pendingComponent: Loader,
})
