import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/publish',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      unpublish: search.unpublish === 'true',
      scheduled: search.scheduled === 'true',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/(protected)/courses/$lmsCode/modules/$itemId/publish"!</div>
  )
}
