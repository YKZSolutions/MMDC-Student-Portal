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
import type { Block } from '@blocknote/core'
import type { NodeModel } from '@minoru/react-dnd-treeview'

export interface ContentProgress {
  contentId: string
  isCompleted: boolean
  completedAt?: string
}

export interface Published {
  isPublished: boolean
  publishedAt: string
  toPublishAt: string
  unpublishedAt: string
}

export interface Module {
  id: string
  courseCode: string
  courseName: string
  courseSection: string
  sections: ModuleSection[]
  published: Published
}

export interface ModuleSection extends Published {
  id: string
  parentId: string
  moduleId: string
  parentSectionId: string
  prerequisiteSectionId: string
  title: string
  order: number
  items: ModuleItem[]
  subsections: ModuleSection[]
  prerequisites?: string[]
}

export interface ModuleItem {
  id: string
  parentId: string
  type: ContentType
  title: string
  order: number
  prerequisites?: string[]
  content?: Block[]
  url?: string
  progress?: ContentProgress
  assignment?: AssignmentBase | StudentAssignment
  published: Published
}

export type ContentType = 'lesson' | 'assignment'

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
