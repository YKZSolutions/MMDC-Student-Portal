import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/profile"!</div>
}
