import {
  type ContentNode,
  type ContentNodeType,
} from '@/features/courses/modules/types.ts'
import type { DetailedModuleSectionDto, ModuleContent } from '@/integrations/api/client'
import {
  lmsContentControllerFindOneOptions,
  lmsSectionControllerFindOneOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContentKeyAndData, toBlockArray } from '@/utils/helpers.tsx'
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
  data: ModuleContent
  content: BlockNoteEditor
  section: DetailedModuleSectionDto
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
  const { itemId } = useParams({ strict: false })

  const moduleContentId = searchParams.id ?? itemId ?? ''

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const { data: moduleSectionData } = useSuspenseQuery(
    lmsSectionControllerFindOneOptions({
      path: {
        moduleSectionId: moduleContentData.moduleSectionId || '',
      },
    }),
  )

  console.log('Fetched Section Data:', moduleSectionData)

  const { contentKey, existingContent } =
    getContentKeyAndData(moduleContentData)

  const editor = useCreateBlockNote(
    {
      initialContent: toBlockArray(existingContent?.content),
    },
    [moduleContentId],
  )

  const editorState = {
    id: (searchParams.id as string) || null,
    type: (searchParams.type as ContentNodeType) || 'section',
    view: (searchParams.view as EditorView) || 'content',
    data: moduleContentData,
    content: editor,
    section: moduleSectionData,
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
