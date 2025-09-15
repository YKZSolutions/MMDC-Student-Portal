import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'
import { convertModuleToTreeData } from '@/utils/helpers'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createContext, useContext, type ReactNode } from 'react'
import { mockModule } from '../mocks'

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

export interface EditorSearchParams extends Omit<EditorState, 'data'> {
  id: string | null
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
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const searchParams: EditorSearchParams = useSearch({ strict: false })

  // TODO: Implement the real fetching of data here
  const data =
    convertModuleToTreeData(mockModule).find(
      (node) => node.id === searchParams.id,
    )?.data?.contentData || null

  console.log(data)

  const editorState = {
    type: (searchParams.type as ContentNodeType) || 'section',
    parentId: (searchParams.parentId as string) || null,
    view: (searchParams.view as EditorView) || 'content',
    id: (searchParams.id as string) || null,
  } satisfies EditorSearchParams

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

    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        id: nodeData.id,
      }),
    })
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
