import ModulesContentPage from '@/pages/shared/courses/$courseCode/modules/$itemId'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/',
)({
  component: RouteComponent,
})

//TODO: Replace with actual fetch
function RouteComponent() {
  
  return (
    <ModulesContentPage />
  )
}
