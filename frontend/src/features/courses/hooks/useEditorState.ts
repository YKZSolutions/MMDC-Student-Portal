import { useState } from 'react'
import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'

export interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  view: EditorView
}

export type EditorView = 'detail' | 'content' | 'preview'

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    type: 'section',
    data: null,
    parentId: null,
    view: 'detail',
  })

  const handleAdd = (parentId: string = '0', newType?: ContentNodeType) => {
    setEditorState({
      type: newType || 'section',
      data: null,
      parentId,
      view: 'detail',
    })
  }

  const handleUpdate = (
    nodeType: ContentNodeType,
    nodeData: ContentNode,
    view: EditorView,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      view,
    })
  }

  const handlePreview = (nodeType: ContentNodeType, nodeData: ContentNode) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      view: 'preview',
    })
  }

  const setView = (view: EditorView) => {
    setEditorState((prev) => ({ ...prev, view }))
  }

  return {
    editorState,
    handleAdd,
    handleUpdate,
    handlePreview,
    setView,
  }
}
