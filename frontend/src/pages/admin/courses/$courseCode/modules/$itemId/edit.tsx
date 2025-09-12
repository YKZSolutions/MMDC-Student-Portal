import { CMS } from "@/features/courses/cms/cms"
import { useParams } from "@tanstack/react-router"

function ModulesItemEditPage() {
  const { courseCode, itemId } = useParams({ strict: false })
  
  return <CMS courseCode={courseCode} itemId={itemId} />
}
export default ModulesItemEditPage
