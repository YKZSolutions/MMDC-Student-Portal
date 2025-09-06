import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/publish',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      unpublish: search.unpublish === 'true',
      scheduled: search.schedule === 'true',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/(protected)/courses/$courseCode/modules/$itemId/publish"!</div>
  )
}
