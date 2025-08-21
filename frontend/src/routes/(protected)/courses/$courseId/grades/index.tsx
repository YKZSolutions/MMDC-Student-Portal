import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/courses/$courseId/grades/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/courses/$courseId/grades/"!</div>
}
