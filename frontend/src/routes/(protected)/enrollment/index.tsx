import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/enrollment/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/enrollment"!</div>
}
