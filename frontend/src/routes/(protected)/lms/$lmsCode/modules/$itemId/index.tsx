import ModulesContentPage from '@/pages/shared/lms/$lmsCode/modules/$itemId'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/modules/$itemId/',
)({
  component: RouteComponent,
})

//TODO: Replace with actual fetch
function RouteComponent() {
  
  return (
    <ModulesContentPage />
  )
}
