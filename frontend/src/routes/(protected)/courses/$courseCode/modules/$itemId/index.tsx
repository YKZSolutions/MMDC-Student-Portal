import { createFileRoute } from '@tanstack/react-router'
import { mockModule } from '@/features/courses/mocks.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  getAllModuleSections,
  getModuleItemsFromModule,
} from '@/utils/helpers.ts'
import ModuleContentView from '@/features/courses/modules/content/module-content-view.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/$itemId/',
)({
  component: RouteComponent,
})

//TODO: Replace with actual fetch
function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { itemId } = Route.useParams()

  if (!itemId) {
    return null
  }

  // Find the current item and its parent section
  const currentItem = getModuleItemsFromModule(mockModule).find(
    (item) => item.id === itemId,
  )
  if (!currentItem) {
    return null
  }
  const parentSection = getAllModuleSections(mockModule).find(
    (section) => section.id === currentItem.parentId,
  )

  if (!parentSection) {
    return null
  }

  return (
    <ModuleContentView
      moduleItem={currentItem}
      parentSection={parentSection}
      module={mockModule}
    />
  )
}
