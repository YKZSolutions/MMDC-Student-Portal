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

export interface ModuleContent {
  id: string
  title: string
  content?: string
  fileUrl?: string
  progress?: ContentProgress[]
  assignment?: AssignmentBase | StudentAssignment
}

export interface Module {
  id: string
  courseCode: string
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
  content?: ModuleContent
  prerequisites?: string[]
}

export type ContentType =
  | 'lesson'
  | 'assignment'
  | 'discussion'
  | 'url'
  | 'file'

export type ContentNode = Module | ModuleSection | ModuleItem
export type ContentNodeType = 'module' | 'section' | 'item'

export interface CourseNodeData {
  parentType?: ContentNodeType
  type: ContentNodeType | 'add-button'
  contentData?: Module | ModuleSection | ModuleItem
}

export type CourseNodeModel = NodeModel<CourseNodeData>

// Flat structure for tree nodes - each node only contains its own data
// The hierarchy is maintained through parent/child relationships
export const mockCourseTreeData: CourseNodeModel[] = [
  // Module node
  {
    id: 'mod_1',
    parent: '0', // Root
    text: 'Introduction to Biology',
    droppable: true,
    data: {
      type: 'module',
      contentData: {
        id: 'mod_1',
        courseCode: 'course_1',
        title: 'Introduction to Biology',
        order: 1,
        sections: [], // Sections will be represented as separate nodes
      },
    },
  },
  // Section node (child of module)
  {
    id: 'sec_1',
    parent: 'mod_1',
    text: 'Readings',
    droppable: true,
    data: {
      type: 'section',
      contentData: {
        id: 'sec_1',
        title: 'Readings',
        order: 1,
        items: [], // Items will be represented as separate nodes
      },
    },
  },
  // Item node (child of section)
  {
    id: 'item_1',
    parent: 'sec_1',
    text: 'Chapter 1: Cell Structure',
    droppable: false,
    data: {
      type: 'item',
      contentData: {
        id: 'item_1',
        type: 'reading',
        title: 'Chapter 1: Cell Structure',
        order: 1,
        content: {
          id: 'read_1',
          title: 'Chapter 1: Cell Structure',
          fileUrl: '/uploads/cell-structure.pdf',
          isCompleted: false,
        },
      },
    },
  },
  // Another section
  {
    id: 'sec_2',
    parent: 'mod_1',
    text: 'Assignments',
    droppable: true,
    data: {
      type: 'section',
      contentData: {
        id: 'sec_2',
        title: 'Assignments',
        order: 2,
        items: [],
      },
    },
  },
  // Assignment item
  {
    id: 'item_2',
    parent: 'sec_2',
    text: 'Cell Biology Quiz',
    droppable: false,
    data: {
      type: 'item',
      contentData: {
        id: 'item_2',
        type: 'assignment',
        title: 'Cell Biology Quiz',
        order: 1,
        assignment: {
          id: '1',
          title: 'Cell Biology Quiz',
          type: 'quiz',
          dueDate: '2023-10-15T23:59:59Z',
          mode: 'individual',
          points: 100,
          status: 'open',
        },
      },
    },
  },
  // Add another module
  {
    id: 'mod_2',
    parent: '0',
    text: 'Genetics',
    droppable: true,
    data: {
      type: 'module',
      contentData: {
        id: 'mod_2',
        courseCode: 'course_1',
        title: 'Genetics',
        order: 2,
        sections: [],
      },
    },
  },
]

export const mockContentNodes: ContentNode[] = [
  {
    id: 'mod_1',
    courseCode: 'course_1',
    title: 'Introduction to Biology',
    order: 1,
    sections: [
      {
        id: 'sec_1',
        title: 'Readings',
        order: 1,
        items: [
          {
            id: 'item_1',
            type: 'reading',
            title: 'Chapter 1: Cell Structure',
            order: 1,
            content: {
              id: 'read_1',
              title: 'Chapter 1: Cell Structure',
              fileUrl: '/uploads/cell-structure.pdf',
              isCompleted: false,
            },
          },
        ],
      },
      {
        id: 'sec_2',
        title: 'Assignments',
        order: 2,
        items: [
          {
            id: 'item_2',
            type: 'assignment',
            title: 'Cell Biology Quiz',
            order: 1,
            assignment: {
              id: '1',
              title: 'Cell Biology Quiz',
              type: 'quiz',
              dueDate: '2023-10-15T23:59:59Z',
              mode: 'individual',
              points: 100,
              status: 'open',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mod_2',
    courseCode: 'course_1',
    title: 'Genetics',
    order: 2,
    sections: [],
  },
]
