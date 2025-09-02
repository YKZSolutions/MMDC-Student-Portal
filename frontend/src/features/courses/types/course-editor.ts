import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'

export interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  mode: 'create' | 'edit' | 'preview'
}
