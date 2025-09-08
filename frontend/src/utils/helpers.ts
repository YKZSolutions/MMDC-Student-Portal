import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  CourseNodeModel,
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import type { AcademicTerm } from '@/features/courses/types.ts'

export function getTypeFromLevel(level?: number) {
  switch (level) {
    case 1:
      return 'section'
    case 2:
      return 'subsection'
    case 3:
      return 'item'
    default:
      return 'section'
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
    parentId: string = 'root',
    level: number = 1,
  ) => {
    const sectionNode: CourseNodeModel = {
      id: section.id,
      parent: parentId,
      text: section.title,
      droppable: true,
      data: {
        level,
        type: getTypeFromLevel(level),
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
          level: 3,
          type: 'item',
          contentData: item,
        },
      }
      treeData.push(itemNode)
    })

    // Process subsections recursively
    if (section.subsections) {
      section.subsections.forEach((subsection) => {
        processSection(subsection, section.id, 2)
      })
    }
  }

  // Process all top-level sections
  module.sections.forEach((section) => {
    processSection(section)
  })

  return treeData
}

export function getModuleSubSectionsFromModule(module: Module) {
  return module.sections.flatMap((section) => section.subsections)
}

export function getModuleSubSectionsFromSections(sections: ModuleSection[]) {
  return sections.flatMap((section) => section.subsections)
}

export function getAllModuleSections(module: Module) {
  const sections = module.sections
  const subsections = getModuleSubSectionsFromSections(sections)
  return [...sections, ...subsections]
}

export function getModuleItemsFromModule(module: Module) {
  const sections = getAllModuleSections(module)
  return sections.flatMap((section) => section.items)
}

export function getModuleItemsFromSections(sections: ModuleSection[]) {
  return sections.flatMap((section) => section.items)
}

export const createFilterOption = (value: string) => ({
  label: value,
  value: value.toLowerCase(),
})

export const getCompletedItemsCount = (items: ModuleItem[]) => {
  return items.filter((item) => {
    if (item.type === 'lesson' && item.progress) {
      return item.progress.isCompleted
    }
    if (item.type === 'assignment' && item.assignment) {
      const submissionStatus = getSubmissionStatus(item.assignment)
      return (
        submissionStatus === 'graded' ||
        submissionStatus === 'ready-for-grading' ||
        submissionStatus === 'submitted'
      )
    }
    return false
  }).length
}

export const getOverdueItemsCount = (items: ModuleItem[]) => {
  return items.filter((item) => {
    if (item.type === 'assignment' && item.assignment?.dueDate) {
      return (
        new Date(item.assignment.dueDate) < new Date() &&
        getSubmissionStatus(item.assignment) === 'pending'
      )
    }
    return false
  }).length
}

export const formatTerm = (academicTerm: AcademicTerm | undefined) => {
  return academicTerm
    ? `${academicTerm.schoolYear} - ${academicTerm.term}`
    : 'N/A'
}
