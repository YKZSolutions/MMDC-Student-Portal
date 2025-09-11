import SubmissionPage from '@/pages/admin/courses/$courseCode/modules/$itemId/submit'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/submit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { itemId } = Route.useParams()
  return <SubmissionPage assignmentId={itemId} />
}
