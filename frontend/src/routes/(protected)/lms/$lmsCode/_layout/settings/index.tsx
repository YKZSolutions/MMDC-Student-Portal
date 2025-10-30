import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/settings/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/lms/$lmsCode/_layout/settings/"!</div>
}
