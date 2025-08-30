import type {
  Assignment,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  CourseModule,
  CourseNodeModel,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'

export function getChildTypeFromParentType(parentType?: string) {
  if (!parentType) return 'module'

  switch (parentType) {
    case 'module':
      return 'section'
    case 'section':
      return 'item'
    default:
      return 'module'
  }
}

export function isPastDueDate(date: string) {
  const today = new Date()
  const dueDate = new Date(date)
  return dueDate < today
}

// TODO: remove these if not needed, these are currently used for mocking dates
export function getFutureDate(daysToAdd: number) {
  return new Date(
    new Date().setDate(new Date().getDate() + daysToAdd),
  ).toISOString()
}

export function getPastDate(daysToSubtract: number) {
  return new Date(
    new Date().setDate(new Date().getDate() - daysToSubtract),
  ).toISOString()
}

export function getSubmissionStatus(
  assignment: Assignment | StudentAssignment | undefined,
) {
  if (!assignment) return undefined

  if ('submissionStatus' in assignment) {
    return assignment.submissionStatus
  }

  return undefined
}

// Helper function to convert flat tree structure to hierarchical CourseModule structure
export function convertTreeToCourseModules(
  treeData: CourseNodeModel[],
): CourseModule[] {
  const modules: CourseModule[] = []

  // First, find all module nodes
  const moduleNodes = treeData.filter((node) => node.data?.type === 'module')

  for (const moduleNode of moduleNodes) {
    if (!moduleNode.data?.contentData) continue

    // Create module with basic data
    const moduleData = moduleNode.data.contentData as CourseModule
    const module: CourseModule = {
      ...moduleData,
      sections: [],
    }

    // Find all sections that are children of this module
    const sectionNodes = treeData.filter(
      (node) => node.parent === moduleNode.id && node.data?.type === 'section',
    )

    for (const sectionNode of sectionNodes) {
      if (!sectionNode.data?.contentData) continue

      // Create section with basic data
      const sectionData = sectionNode.data.contentData as ModuleSection
      const section: ModuleSection = {
        ...sectionData,
        items: [],
      }

      // Find all items that are children of this section
      const itemNodes = treeData.filter(
        (node) => node.parent === sectionNode.id && node.data?.type === 'item',
      )

      for (const itemNode of itemNodes) {
        if (!itemNode.data?.contentData) continue

        // Add item to section
        section.items.push(itemNode.data.contentData as ModuleItem)
      }

      // Add section to module
      module.sections.push(section)
    }

    // Add module to result
    modules.push(module)
  }

  // Sort modules by position
  return modules.sort((a, b) => a.position - b.position)
}

// Helper function to convert hierarchical CourseModule structure to flat tree structure
export function convertCourseModulesToTree(
  modules: CourseModule[],
): CourseNodeModel[] {
  const treeData: CourseNodeModel[] = []

  for (const module of modules) {
    // Add module node
    treeData.push({
      id: module.id,
      parent: '0',
      text: module.title,
      droppable: true,
      data: {
        type: 'module',
        contentData: module,
      },
    })

    for (const section of module.sections) {
      // Add section node
      treeData.push({
        id: section.id,
        parent: module.id,
        text: section.title,
        droppable: true,
        data: {
          type: 'section',
          contentData: section,
        },
      })

      for (const item of section.items) {
        // Add item node
        treeData.push({
          id: item.id,
          parent: section.id,
          text: item.title,
          droppable: false,
          data: {
            type: 'item',
            contentData: item,
          },
        })
      }
    }
  }

  return treeData
}
