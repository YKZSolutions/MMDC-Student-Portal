import { useState } from 'react'
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

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    type: 'module',
    data: null,
    parentId: null,
    mode: 'create',
  })

  const handleAdd = (parentId: string = 'root', newType?: ContentNodeType) => {
    setEditorState({
      type: newType || 'module',
      data: null,
      parentId,
      mode: 'create',
    })
  }

  const handleEdit = (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: ContentNode,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      mode: 'edit',
    })
  }

  const handlePreview = (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: ContentNode,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      mode: 'preview',
    })
  }

  return {
    editorState,
    handleAdd,
    handleEdit,
    handlePreview,
  }
}
