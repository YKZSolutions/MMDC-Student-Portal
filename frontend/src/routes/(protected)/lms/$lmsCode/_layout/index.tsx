import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/$lmsCode/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/lms/$lmsCode/_layout/"!</div>
}
