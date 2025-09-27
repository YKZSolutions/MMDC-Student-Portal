import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  ContentNode,
  CourseNodeModel,
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import type { AcademicTerm } from '@/features/courses/types.ts'
import type {
  BasicModuleItemDto,
  ContentType,
  ModuleContent,
} from '@/integrations/api/client'
import type { Block, BlockNoteEditor } from '@blocknote/core'
import {
  IconCalendarTime,
  IconClipboard,
  IconExternalLink,
  IconFileText,
  IconMessageCircle,
  IconPaperclip,
} from '@tabler/icons-react'

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

export function injectAddButtons(nodes: CourseNodeModel[]): CourseNodeModel[] {
  const augmented: CourseNodeModel[] = [...nodes]

  function inject(nodeParent: string, level: number) {
    augmented.push({
      id: `${nodeParent}-add`,
      parent: nodeParent,
      text: 'Add',
      droppable: false,
      data: {
        level: level,
        type: 'add-button',
      },
    })
  }

  // Add "Add" buttons after the last child of each section
  for (const node of nodes) {
    if (node.data && node.data.level !== 3) {
      const level = node.data.level + 1
      inject(node.id as string, level)
    }
  }

  inject('root', 1)

  return augmented
}

// Convert a Module (local model) into CourseNodeModel[] for the Tree component
export function convertModuleToTreeData(module: Module): CourseNodeModel[] {
  return convertSectionsToTreeData(module.sections as any[])
}

// Convert API DTO sections into CourseNodeModel[] for the Tree component
export function convertModuleSectionsToTreeData(
  sections: ContentNode[],
): CourseNodeModel[] {
  return convertSectionsToTreeData(sections)
}

// Shared implementation: simple, non-mutating traversal that flattens
// sections, subsections and items into the node list expected by the Tree.
function convertSectionsToTreeData(sections: ContentNode[]): CourseNodeModel[] {
  const treeData: CourseNodeModel[] = []

  function processSection(section: ContentNode, parentId = 'root', level = 1) {
    if (!section) return

    treeData.push({
      id: section.id,
      parent: parentId,
      text: section.title ?? 'Untitled Section',
      droppable: getTypeFromLevel(level) !== 'item',
      data: {
        level,
        type: getTypeFromLevel(level),
        contentData: section,
      },
    })

    // This is still needed for the mock items.
    // Remove if real data always has items defined.

    // if ('items' in section) {
    //   const items = section.items ?? []
    //   for (const item of items) {
    //     if (!item) continue
    //     treeData.push({
    //       id: item.id,
    //       parent: section.id,
    //       text: item.title ?? 'Untitled Item',
    //       droppable: false,
    //       data: {
    //         level: 3,
    //         type: 'item',
    //         contentData: {
    //           ...item,
    //           moduleId: section.moduleId,
    //           parentSectionId: section.id,
    //           prerequisiteSectionId: item.prerequisites?.[0] || '',
    //           publishedAt: new Date().toISOString(),
    //           toPublishAt: new Date().toISOString(),
    //           unpublishedAt: new Date().toISOString(),
    //         },
    //       },
    //     })
    //   }
    // }

    if ('moduleContents' in section) {
      const items = section.moduleContents ?? []
      for (const item of items) {
        if (!item) continue
        treeData.push({
          id: item.id,
          parent: section.id,
          text:
            getContentKeyAndData(item).existingContent?.title ??
            'Untitled Item',
          droppable: false,
          data: {
            level: 3,
            type: 'item',
            contentData: {
              ...item,
              title: getContentKeyAndData(item).existingContent?.title ?? '',
              moduleId: section.moduleId,
              parentSectionId: '',
              prerequisiteSectionId: '',
            },
          },
        })
      }
    }

    const subs = section.subsections ?? []
    for (const sub of subs) {
      processSection(sub, section.id, level + 1)
    }
  }

  for (const section of sections) processSection(section)

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
  let items: ModuleItem[] = []
  sections.forEach((s) => {
    items = [
      ...items,
      ...s.items,
      ...getModuleItemsFromSections(s.subsections || []),
    ]
  })
  return items.sort((a, b) => a.order - b.order)
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

// Ensures that the content is a valid Block array for BlockNote initialization
export const toBlockArray = (content: unknown): Block[] => {
  if (Array.isArray(content) && content.length > 0) {
    return content as Block[]
  }

  return [
    {
      id: 'initial-paragraph',
      type: 'paragraph',
      props: {
        backgroundColor: 'transparent',
        textAlignment: 'left',
        textColor: 'initial',
      },
      content: [],
      children: [],
    },
  ]
}

export const getContentTypeIcon = (contentType: ContentType) => {
  switch (contentType) {
    case 'LESSON':
      return <IconFileText size={16} />
    case 'ASSIGNMENT':
      return <IconClipboard size={16} />
    case 'QUIZ':
      return <IconPaperclip size={16} />
    case 'DISCUSSION':
      return <IconMessageCircle size={16} />
    case 'FILE':
      return <IconPaperclip size={16} />
    case 'URL':
      return <IconExternalLink size={16} />
    case 'VIDEO':
      return <IconCalendarTime size={16} />
    default:
      return 'Untitled Item'
  }
}

// Helper type: maps ModuleContent.contentType (e.g. 'LESSON') to the corresponding
// lowercased key on the ModuleContent object (e.g. 'lesson').
type ModuleContentKeyFor<U extends ModuleContent | BasicModuleItemDto> =
  U extends {
    contentType: infer CT
  }
    ? CT extends string
      ? Lowercase<CT> extends keyof U
        ? Lowercase<CT>
        : never
      : never
    : never

export type ExistingContent<T extends ModuleContent | BasicModuleItemDto> =
  | NonNullable<T[ModuleContentKeyFor<T>]>
  | undefined

export const getContentKeyAndData = <
  T extends ModuleContent | BasicModuleItemDto,
>(
  data: T,
): {
  contentKey: ModuleContentKeyFor<T>
  existingContent: NonNullable<T[ModuleContentKeyFor<T>]> | undefined
} => {
  const contentKey = data.contentType.toLowerCase() as ModuleContentKeyFor<T>

  // Read the property and cast to the precise type so callers get IntelliSense.
  const existingContent = (data[contentKey] ?? undefined) as
    | NonNullable<T[ModuleContentKeyFor<T>]>
    | undefined

  return { contentKey, existingContent }
}

export const isEditorEmpty = (editor: BlockNoteEditor) => {
  if (editor.document.length !== 1) return false

  const block = editor.document[0]
  if (block.type !== 'paragraph') return false

  // Ensure content array is empty or only contains empty text
  return (
    block.content.length === 0 ||
    block.content.every((c) => c.type === 'text' && c.text.trim() === '')
  )
}
