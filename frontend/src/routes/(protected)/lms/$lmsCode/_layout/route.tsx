import { LMSNavigationLayout } from '@/pages/shared/lms/lms-view-navigation.layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/$lmsCode/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LMSNavigationLayout />
}
