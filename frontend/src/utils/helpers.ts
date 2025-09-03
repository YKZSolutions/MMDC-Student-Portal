import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  ContentNodeType,
  CourseNodeModel,
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'

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
  assignment: AssignmentBase | StudentAssignment | undefined,
) {
  if (!assignment) return undefined

  if ('submissionStatus' in assignment) {
    return assignment.submissionStatus
  }

  return undefined
}

export function convertModuleToTreeData(module: Module): CourseNodeModel[] {
  const treeData: CourseNodeModel[] = []

  const processSection = (
    section: ModuleSection,
    parentId: string | number = 0,
  ) => {
    const sectionNode: CourseNodeModel = {
      id: section.id,
      parent: parentId,
      text: section.title,
      droppable: true,
      data: {
        type: 'section',
        parentType: parentId === 0 ? undefined : 'section',
        contentData: section,
      },
    }
    treeData.push(sectionNode)

    // Process items in this section
    section.items.forEach((item) => {
      const itemNode: CourseNodeModel = {
        id: item.id,
        parent: section.id,
        text: item.title,
        droppable: false,
        data: {
          type: 'item',
          parentType: 'section',
          contentData: item,
        },
      }
      treeData.push(itemNode)
    })

    // Process subsections recursively
    if (section.subsections) {
      section.subsections.forEach((subsection) => {
        processSection(subsection, section.id)
      })
    }
  }

  // Process all top-level sections
  module.sections.forEach((section) => {
    processSection(section)
  })

  return treeData
}

// Type guards for content node identification
export function isModuleItem(node: any): node is ModuleItem {
  return node && (node as ModuleItem).type !== undefined
}

export function isModuleSection(node: any): node is ModuleSection {
  return node && (node as ModuleSection).items !== undefined
}

export function getContentNodeType(node: any): ContentNodeType {
  return isModuleItem(node) ? 'item' : 'section'
}
