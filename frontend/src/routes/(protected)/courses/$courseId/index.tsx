import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/courses/$courseId/overview/"!</div>
}
