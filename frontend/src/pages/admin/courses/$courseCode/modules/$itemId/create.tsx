import { CMS } from '@/features/courses/cms/cms'
import { useParams } from '@tanstack/react-router'

function ModulesItemCreatePage() {
  const { courseCode } = useParams({ strict: false })
  return <CMS courseCode={courseCode} />
}

export default ModulesItemCreatePage