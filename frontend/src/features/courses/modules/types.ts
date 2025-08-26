import type { ContentType } from '@/features/courses/types.ts'
import type {
  Assignment,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'

export interface Readings {
  title: string
  isRead: boolean
}

export interface ModuleData {
  id: string
  title: string
  subsection: ModuleSubsectionData[]
}

export interface ModuleSubsectionData {
  id: string
  title: string
  items: ModuleSubsectionItemData[]
}

export interface ModuleSubsectionItemData {
  id: string
  itemType: ContentType
  readings?: Readings
  assignment?: Assignment | StudentAssignment
}
