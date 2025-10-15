import {
  type ContentNode,
  type ContentNodeType,
  type FullModuleContent,
} from '@/features/courses/modules/types.ts'
import { lmsContentControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { toBlockArray } from '@/utils/helpers.tsx'
import type { BlockNoteEditor } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
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
  data: FullModuleContent
  content: BlockNoteEditor
  view: EditorView
}

export interface EditorSearchParams
  extends Omit<EditorState, 'data' | 'content'> {
  id: string | null
}

interface EditorContextValue {
  editorState: EditorState
  handleAdd: (fn: (open: boolean) => void) => void
  handleNavigate: (nodeData: ContentNode) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const searchParams: EditorSearchParams = useSearch({
    strict: false,
  })
  const { itemId } = useParams({ strict: false })

  const moduleContentId = searchParams.id ?? itemId ?? ''

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const editor = useCreateBlockNote(
    {
      initialContent: toBlockArray(moduleContentData?.content),
    },
    [moduleContentId],
  )

  const editorState = {
    id: (searchParams.id as string) || null,
    type: (searchParams.type as ContentNodeType) || 'section',
    view: (searchParams.view as EditorView) || 'content',
    data: moduleContentData,
    content: editor,
  } satisfies EditorState

  const handleAdd = (fn: (open: boolean) => void) => {
    fn(true)
  }

  const handleNavigate = (nodeData: ContentNode) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        id: nodeData.id,
      }),
    })
  }

  return (
    <EditorContext.Provider
      value={{
        editorState,
        handleAdd,
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
