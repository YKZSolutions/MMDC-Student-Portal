import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type { NodeModel } from '@minoru/react-dnd-treeview'

export interface ContentProgress {
  contentId: string
  isCompleted: boolean
  completedAt?: string
}

export interface Module {
  id: string
  courseCode: string
  courseName: string
  courseSection: string
  sections: ModuleSection[]
}

export interface ModuleSection {
  id: string
  title: string
  order: number
  items: ModuleItem[]
  subsections?: ModuleSection[]
  prerequisites?: string[]
}

export interface ModuleItem {
  id: string
  type: ContentType
  title: string
  order: number
  prerequisites?: string[]
  content?: string
  progress?: ContentProgress[]
  assignment?: AssignmentBase | StudentAssignment
}

export type ContentType =
  | 'lesson'
  | 'assignment'
  | 'discussion'
  | 'url'
  | 'file'

export type ContentNode = ModuleSection | ModuleItem
export type ContentNodeType = 'section' | 'item' | 'add-button'

export interface CourseNodeData {
  parentType?: ContentNodeType
  type: ContentNodeType
  contentData?: ContentNode
}

export type CourseNodeModel = NodeModel<CourseNodeData>
