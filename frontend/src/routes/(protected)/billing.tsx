import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/billing"!</div>
}
