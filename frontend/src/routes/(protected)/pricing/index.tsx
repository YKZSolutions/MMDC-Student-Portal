import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/pricing/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/pricing/"!</div>
}
