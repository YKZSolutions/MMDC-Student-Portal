import { CMS } from '@/features/courses/cms/cms'
import { useParams } from '@tanstack/react-router'

function ModulesCreateAdminPage() {
  const { courseCode } = useParams({ strict: false })
  return <CMS courseCode={courseCode} />
}

export default ModulesCreateAdminPage
