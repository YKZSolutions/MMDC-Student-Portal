import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/submissions/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/courses/$courseId/submissions/"!</div>
}
