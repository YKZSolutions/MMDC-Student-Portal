import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type { ModuleTreeSectionDto } from '@/integrations/api/client'
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

export type ContentType =
  | 'lesson'
  | 'assignment'
  | 'discussion'
  | 'url'
  | 'file'

export type ContentNode = ModuleTreeSectionDto
export type ContentNodeType = 'section' | 'subsection' | 'item' | 'add-button'

export interface CourseNodeData {
  level: number
  type: ContentNodeType
  contentData?: ContentNode
}

export type CourseNodeModel = NodeModel<CourseNodeData>
