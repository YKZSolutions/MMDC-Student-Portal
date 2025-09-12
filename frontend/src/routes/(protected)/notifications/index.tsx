import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/notifications/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/notifications"!</div>
}
