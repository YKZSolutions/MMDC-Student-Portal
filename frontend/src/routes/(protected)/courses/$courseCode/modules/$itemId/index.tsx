import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/courses/$courseCode/modules/$itemId/"!</div>
}
