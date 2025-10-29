import { Loader } from '@/components/loader-component'
import ModulesContentPage from '@/pages/shared/lms/$lmsCode/modules/$itemId'
import LMSModuleViewPage from '@/pages/shared/lms/modules/lms-module-view.page'
import {
  lmsContentControllerFindOneOptions,
  lmsControllerFindModuleTreeOptions,
  lmsControllerGetModuleProgressOverviewOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/',
)({
  component: RouteComponent,
  pendingComponent: Loader,
  loader: ({ params, context }) => {
    const { queryClient } = context

    // Prefetch queries without blocking navigation
    // These will run in the background and populate the cache
    queryClient.prefetchQuery(
      lmsContentControllerFindOneOptions({
        path: { moduleContentId: params.itemId },
      }),
    )
    queryClient.prefetchQuery(
      lmsControllerFindModuleTreeOptions({
        path: { id: params.lmsCode },
      }),
    )
    queryClient.prefetchQuery(
      lmsControllerGetModuleProgressOverviewOptions({
        path: { id: params.lmsCode },
      }),
    )

    // Don't await - let navigation happen immediately
    return undefined
  },
})

//TODO: Replace with actual fetch
function RouteComponent() {
  return (
    // <ModulesContentPage />
    <LMSModuleViewPage />
  )
}
