import { Loader } from '@/components/loader-component'
import LMSHeaderLayout from '@/pages/shared/lms/lms-view-header.layout'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/$lmsCode')({
  component: RouteComponent,
  pendingComponent: Loader,
})

function RouteComponent() {
  return <LMSHeaderLayout />
}
