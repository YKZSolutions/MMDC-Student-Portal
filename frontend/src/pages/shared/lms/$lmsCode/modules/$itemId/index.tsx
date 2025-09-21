import { mockModule } from '@/features/courses/mocks'
import ModuleContentView from '@/features/courses/modules/content/module-content-view'
import { getAllModuleSections, getModuleItemsFromModule } from '@/utils/helpers'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/lms/$lmsCode/modules/$itemId/')

function ModulesContentPage() {
  const { itemId } = route.useParams()

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

export default ModulesContentPage
