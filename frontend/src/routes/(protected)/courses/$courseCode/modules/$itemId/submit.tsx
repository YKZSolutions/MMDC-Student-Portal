import { createFileRoute } from '@tanstack/react-router'
import SubmissionPage from '@/features/courses/modules/content/submissionPage.tsx'
import { mockStudentModule } from '@/features/courses/mocks.ts'
import { getModuleItemsFromModule } from '@/utils/helpers.ts'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/submit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { itemId } = Route.useParams()
  const assignmentItem = getModuleItemsFromModule(mockStudentModule).find(
    (item) => item.id === itemId,
  )
  if (!assignmentItem) {
    return null
  }
  return <SubmissionPage assignmentItem={assignmentItem} />
}
