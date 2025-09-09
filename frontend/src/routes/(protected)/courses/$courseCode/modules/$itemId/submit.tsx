import { createFileRoute } from '@tanstack/react-router'
import SubmissionPage from '@/features/courses/modules/content/submission-page.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/submit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { itemId } = Route.useParams()
  return <SubmissionPage assignmentId={itemId} />
}
