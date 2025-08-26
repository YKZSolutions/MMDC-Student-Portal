import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/enrollment/$periodId_/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/enrollment/$periodId_/create"!</div>
}
