import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'
import { useSearch } from '@tanstack/react-router'
import { createContext, useContext, useState, type ReactNode } from 'react'

export type EditorView = 'content' | 'preview'

type EditorViewOption = {
  value: EditorView
  label: Capitalize<EditorView>
}

export const editorViewOptions: EditorViewOption[] = [
  { value: 'content', label: 'Content' },
  { value: 'preview', label: 'Preview' },
]

export interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  view: EditorView
}

export interface EditorSearchParams extends Omit<EditorState, 'data'> {}

interface EditorContextValue {
  editorState: EditorState
  handleAdd: (parentId?: string, newType?: ContentNodeType) => void
  handleUpdate: (
    nodeType: ContentNodeType,
    nodeData: ContentNode,
    view: EditorView,
  ) => void
  handlePreview: (nodeType: ContentNodeType, nodeData: ContentNode) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const searchParams: EditorSearchParams = useSearch({ strict: false })

  // TODO: Implement the real fetching of data here

  const editorState = {
    type: (searchParams.type as ContentNodeType) || 'section',
    parentId: (searchParams.parentId as string) || null,
    view: (searchParams.view as EditorView) || 'content',
  } satisfies EditorSearchParams

  const [data, setData] = useState<ContentNode | null>(null)

  const handleAdd = (parentId: string = '0', newType?: ContentNodeType) => {
    // TODO: Implement adding new nodes using mutation
    // setEditorState({
    //   type: newType || 'section',
    //   data: null,
    //   parentId,
    //   view: 'content',
    // })
  }

  const handleUpdate = (
    nodeType: ContentNodeType,
    nodeData: ContentNode,
    view: EditorView,
  ) => {
    // TODO: Implement updating nodes using mutation
    // setEditorState({
    //   type: nodeType,
    //   data: nodeData,
    //   parentId: null,
    //   view,
    // })
    setData(nodeData)
  }

  const handlePreview = (nodeType: ContentNodeType, nodeData: ContentNode) => {}

  return (
    <EditorContext.Provider
      value={{
        editorState: { ...editorState, data } as EditorState,
        handleAdd,
        handleUpdate,
        handlePreview,
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
