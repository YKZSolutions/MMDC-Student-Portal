import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'
import { lmsSectionControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { Block } from '@blocknote/core'
import { useForm } from '@mantine/form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createContext, useContext, type ReactNode } from 'react'

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
  id: string | null
  type: ContentNodeType
  data: ContentNode | null
  content: Block[] | null
  parentId: string | null
  view: EditorView
}

export interface EditorSearchParams
  extends Omit<EditorState, 'data' | 'content'> {
  id: string | null
}

interface EditorContextValue {
  editorState: EditorState
  handleAdd: (parentId?: string, newType?: ContentNodeType) => void
  handleUpdate: (
    nodeType: ContentNodeType,
    nodeData: ContentNode,
    nodeContent: Block[] | null,
  ) => void
  handlePreview: (nodeType: ContentNodeType, nodeData: ContentNode) => void
  handleNavigate: (nodeData: ContentNode) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const searchParams: EditorSearchParams = useSearch({ strict: false })

  const { data: moduleSectionData } = useSuspenseQuery(
    lmsSectionControllerFindOneOptions({
      path: {
        moduleSectionId: searchParams.id || '',
      },
    }),
  )

  const form = useForm<EditorState>({
    mode: 'uncontrolled',
    initialValues: {
      id: (searchParams.id as string) || null,
      type: (searchParams.type as ContentNodeType) || 'section',
      parentId: (searchParams.parentId as string) || null,
      view: (searchParams.view as EditorView) || 'content',
      content: null,
      data: moduleSectionData as ContentNode | null,
    },
    onValuesChange: (values) => {
      navigate({
        to: '.',
        search: (prev) => ({
          ...prev,
          id: values.id,
        }),
      })
    },
  })

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
    nodeContent: Block[] | null,
  ) => {
    form.setFieldValue('content', nodeContent)
  }

  const handlePreview = (nodeType: ContentNodeType, nodeData: ContentNode) => {}

  const handleNavigate = (nodeData: ContentNode) => {
    form.setFieldValue('id', nodeData.id)
  }

  return (
    <EditorContext.Provider
      value={{
        editorState: form.getValues() as EditorState,
        handleAdd,
        handleUpdate,
        handlePreview,
        handleNavigate,
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
