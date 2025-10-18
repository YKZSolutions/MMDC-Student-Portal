import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  ContentNode,
  CourseNodeModel,
  FullModuleContent,
  ModuleTreeContentItem,
  SectionNodeData,
} from '@/features/courses/modules/types.ts'
import type { AcademicTerm } from '@/features/courses/types.ts'
import type {
  AssignmentItemDto,
  ContentType,
  ModuleContent,
  ModuleTreeAssignmentItemDto,
  ModuleTreeDto,
  ModuleTreeSectionDto,
} from '@/integrations/api/client'
import type { Block, BlockNoteEditor } from '@blocknote/core'
import { IconClipboard, IconFileText } from '@tabler/icons-react'

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
export function convertModuleToTreeData(
  module: ModuleTreeDto,
): CourseNodeModel[] {
  return convertSectionsToTreeData(module.moduleSections || [])
}

// Convert API DTO sections into CourseNodeModel[] for the Tree component
export function convertModuleSectionsToTreeData(
  sections: ModuleTreeSectionDto[],
): CourseNodeModel[] {
  return convertSectionsToTreeData(sections)
}

// Shared implementation: simple, non-mutating traversal that flattens
// sections, subsections and items into the node list expected by the Tree.
function convertSectionsToTreeData(
  sections: ModuleTreeSectionDto[],
): CourseNodeModel[] {
  const treeData: CourseNodeModel[] = []

  function processSection(section: ModuleTreeSectionDto, parentId = 'root') {
    if (!section) return

    // Push the section or subsection node
    treeData.push({
      id: section.id,
      parent: parentId,
      text: section.title ?? 'Untitled Section',
      droppable: true,
      data: {
        level: parentId === 'root' ? 1 : 2,
        type: 'section',
        contentData: section,
      } satisfies SectionNodeData,
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

    if (parentId !== 'root') {
      const items: ModuleTreeContentItem[] = section.moduleContents ?? []
      for (const item of items) {
        if (!item) continue
        treeData.push({
          id: item.id,
          parent: section.id,
          text: item.title ?? 'Untitled Item',
          droppable: false,
          data: {
            level: 3,
            type: 'item',
            contentData: {
              ...item,
              title: item.title ?? '',
            },
          },
        })
      }
    }

    const subs = section.subsections ?? []
    for (const sub of subs) {
      processSection(sub, section.id)
    }
  }

  for (const section of sections) processSection(section)

  return treeData
}

export function getModuleSubSectionsFromModule(module: ModuleTreeDto) {
  return module.moduleSections?.flatMap((section) => section.subsections)
}

export function getModuleSubSectionsFromSections(
  sections: ModuleTreeSectionDto[],
) {
  return sections.flatMap((section) => section.subsections)
}

export function getAllModuleSections(
  module: ModuleTreeDto,
): ModuleTreeSectionDto[] {
  const sections: ModuleTreeSectionDto[] = module.moduleSections || []
  const subsections = sections
    .flatMap((section) => section.subsections || [])
    .filter((s): s is ModuleTreeSectionDto => s != null)

  return [...sections, ...subsections]
}

export function getModuleItemsFromModule(
  module: ModuleTreeDto,
): ModuleTreeContentItem[] {
  const sections = getAllModuleSections(module)
  return sections.flatMap((section) => section?.moduleContents)
}

export function getModuleItemsFromSections(sections: ModuleTreeSectionDto[]) {
  let items: ModuleTreeContentItem[] = []
  sections.forEach((s) => {
    items = [
      ...items,
      ...s.moduleContents,
      ...getModuleItemsFromSections(s.subsections || []),
    ]
  })
  return items.sort((a, b) => a.order - b.order)
}

export const createFilterOption = (value: string) => ({
  label: value,
  value: value.toLowerCase(),
})

export const getCompletedItemsCount = (items: ModuleTreeContentItem[]) => {
  return items.filter((item) => {
    if (item.studentProgress) {
      return (
        item.studentProgress.filter((s) => s.status === 'COMPLETED').length > 0
      )
    }

    return false
  }).length
}

export const getOverdueItemsCount = (items: ModuleTreeContentItem[]) => {
  return items.filter((item) => {
    if (item.contentType === 'ASSIGNMENT' && item?.dueDate) {
      return (
        new Date(item.dueDate) < new Date() &&
        item.studentProgress?.[0].status !== 'COMPLETED'
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
    default:
      return 'Untitled Item'
  }
}

// Helper type: maps ModuleContent.contentType (e.g. 'LESSON') to the corresponding
// lowercased key on the ModuleContent object (e.g. 'lesson').
type DetailKeyForContent<U extends FullModuleContent | ModuleTreeContentItem> =
  U extends {
    contentType: infer CT
  }
    ? CT extends string
      ? Lowercase<CT> extends keyof U
        ? Lowercase<CT>
        : never
      : never
    : never

export type ContentDetailOf<
  T extends FullModuleContent | ModuleTreeContentItem,
> = NonNullable<T[DetailKeyForContent<T>]> | undefined

export const resolveContentDetails = <
  T extends FullModuleContent | ModuleTreeContentItem,
>(
  data: T,
): {
  contentKey: DetailKeyForContent<T>
  contentDetails: NonNullable<T[DetailKeyForContent<T>]> | undefined
} => {
  const contentKey = data.contentType.toLowerCase() as DetailKeyForContent<T>

  // Read the property and cast to the precise type so callers get IntelliSense.
  const contentDetails = (data[contentKey] ?? undefined) as
    | NonNullable<T[DetailKeyForContent<T>]>
    | undefined

  return { contentKey, contentDetails }
}

export const isEditorEmpty = (editor: BlockNoteEditor) => {
  if (editor.document.length !== 1) return false

  const block = editor.document[0]
  if (block.type !== 'paragraph') return false

  // Ensure the content array is empty or only contains empty text
  return (
    block.content.length === 0 ||
    block.content.every((c) => c.type === 'text' && c.text.trim() === '')
  )
}
