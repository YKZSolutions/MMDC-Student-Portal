import SubmissionPage from '@/pages/admin/lms/$lmsCode/modules/$itemId/submit'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/submit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { itemId } = Route.useParams()
  return <SubmissionPage assignmentId={itemId} />
}
