import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type { Block } from '@blocknote/core'
import type { NodeModel } from '@minoru/react-dnd-treeview'

export interface ContentProgress {
  contentId: string
  isCompleted: boolean
  completedAt?: string
}

export interface Published {
  isPublished: boolean
  publishedAt?: string
  toPublishAt?: string
}

export interface Module {
  id: string
  courseCode: string
  courseName: string
  courseSection: string
  sections: ModuleSection[]
  published: Published
}

export interface ModuleSection {
  id: string
  parentId: string
  title: string
  order: number
  items: ModuleItem[]
  subsections: ModuleSection[]
  prerequisites?: string[]
  published: Published
}

// DTO shape returned from the API for module tree data. Fields are kept
// permissive so the frontend can consume remote data without schema drift.
export interface ModuleTreeItemDto {
  id: string
  parentId?: string | null
  title?: string
  order?: number
  type?: ContentType
  // published metadata may be present in different forms
  publishedAt?: string | null
}

export interface ModuleTreeSectionDto {
  id: string
  parentSectionId?: string | null
  title?: string
  order?: number
  items?: ModuleTreeItemDto[]
  subsections?: ModuleTreeSectionDto[] | null
  publishedAt?: string | null
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

export type ContentNode = ModuleSection | ModuleItem
export type ContentNodeType = 'section' | 'subsection' | 'item' | 'add-button'

export interface CourseNodeData {
  level: number
  type: ContentNodeType
  contentData?: ContentNode
}

export type CourseNodeModel = NodeModel<CourseNodeData>
