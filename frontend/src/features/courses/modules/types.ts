import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type {
  AssignmentItemDto,
  LessonItemDto,
  ModuleTreeAssignmentItemDto,
  ModuleTreeLessonItemDto,
  ModuleTreeSectionDto,
} from '@/integrations/api/client'
import type { NodeModel } from '@minoru/react-dnd-treeview'

export type FullModuleContent =
  | (LessonItemDto & { contentType: 'LESSON' })
  | (AssignmentItemDto & { contentType: 'ASSIGNMENT' })

type ContentTypeMap = {
  LESSON: ModuleTreeLessonItemDto
  ASSIGNMENT: ModuleTreeAssignmentItemDto
}

export type ModuleTreeContentItem = {
  [K in keyof ContentTypeMap]: ContentTypeMap[K] & { contentType: K }
}[keyof ContentTypeMap]

export type ContentNode = ModuleTreeSectionDto | ModuleTreeContentItem
export type ContentNodeType = 'section' | 'item' | 'add-button'

export interface SectionNodeData {
  level: 1 | 2
  type: 'section'
  contentData: ModuleTreeSectionDto
}

/**
 * Item → ModuleTreeContentItem
 */
export interface ItemNodeData {
  level: 3
  type: 'item'
  contentData: ModuleTreeContentItem
}

/**
 * Add-button → undefined
 */
export interface AddButtonNodeData {
  level: number
  type: 'add-button'
  contentData?: undefined
}

/**
 * Combined discriminated union
 */
export type CourseNodeData = SectionNodeData | ItemNodeData | AddButtonNodeData

export type CourseNodeModel = NodeModel<CourseNodeData>
