import type {
  Assignment,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'

export interface ReadingMaterial {
  id: string
  title: string
  content?: string
  fileUrl?: string
  isCompleted: boolean
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  position: number
  sections: ModuleSection[]
}

export interface ModuleSection {
  id: string
  title: string
  position: number
  items: ModuleItem[]
}

export interface ModuleItem {
  id: string
  type: ContentType
  title: string
  position: number
  content?: ReadingMaterial
  assignment?: Assignment | StudentAssignment
}

export type ContentType =
  | 'reading'
  | 'assignment'
  | 'quiz'
  | 'discussion'
  | 'url'
  | 'file'

export type ContentNode = CourseModule | ModuleSection | ModuleItem
export type ContentNodeType = 'module' | 'section' | 'item'

export interface CourseContentOverview {
  courseId: string
  modules: ModuleSummary[]
  totalItems: number
  completedItems: number
}

export interface ModuleSummary {
  id: string
  title: string
  position: number
  sectionCount: number
  itemCount: number
  completedItems: number
}
