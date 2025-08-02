import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/users"!</div>
}
