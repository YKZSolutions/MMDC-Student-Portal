import {
  type ContentNode,
  type ContentNodeType,
} from '@/features/courses/modules/types.ts'
import type { ModuleContent } from '@/integrations/api/client'
import { lmsContentControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { getModuleContent, toBlockArray } from '@/utils/helpers.tsx'
import type { BlockNoteEditor } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
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
  data: ModuleContent
  content: BlockNoteEditor
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
  handlePreview: (nodeType: ContentNodeType, nodeData: ContentNode) => void
  handleNavigate: (nodeData: ContentNode) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const searchParams: EditorSearchParams = useSearch({ strict: false })

  // const { data: moduleSectionData } = useSuspenseQuery(
  //   lmsSectionControllerFindOneOptions({
  //     path: {
  //       moduleSectionId: searchParams.id || '',
  //     },
  //   }),
  // )

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: {
        moduleContentId: searchParams.id || '',
      },
    }),
  )

  // console.log('Fetched Section Data:', moduleSectionData)
  console.log('Fetched Content Data:', moduleContentData)

  const editor = useCreateBlockNote({
    initialContent: toBlockArray(getModuleContent(moduleContentData)?.content),
  })

  const editorState = {
    id: (searchParams.id as string) || null,
    type: (searchParams.type as ContentNodeType) || 'section',
    parentId: (searchParams.parentId as string) || null,
    view: (searchParams.view as EditorView) || 'content',
    data: moduleContentData,
    content: editor,
  } satisfies EditorState

  const handleAdd = (parentId: string = '0', newType?: ContentNodeType) => {
    // TODO: Implement adding new nodes using mutation
    // setEditorState({
    //   type: newType || 'section',
    //   data: null,
    //   parentId,
    //   view: 'content',
    // })
  }

  const handlePreview = (nodeType: ContentNodeType, nodeData: ContentNode) => {}

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
