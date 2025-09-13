import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'
import { createContext, useContext, useState, type ReactNode } from 'react'

export type EditorView = 'detail' | 'content' | 'preview'

export interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  view: EditorView
}

interface EditorContextValue {
  editorState: EditorState
  handleAdd: (parentId?: string, newType?: ContentNodeType) => void
  handleUpdate: (
    nodeType: ContentNodeType,
    nodeData: ContentNode,
    view: EditorView,
  ) => void
  handlePreview: (nodeType: ContentNodeType, nodeData: ContentNode) => void
  setView: (view: EditorView) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
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

  return (
    <EditorContext.Provider
      value={{
        editorState,
        handleAdd,
        handleUpdate,
        handlePreview,
        setView,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorState() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorState must be used within an EditorProvider')
  }
  return context
}
