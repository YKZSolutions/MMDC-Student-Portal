import {
  EditorProvider,
  useEditorState,
} from '@/features/courses/hooks/useEditorState'
import ModuleContentView from '@/features/courses/modules/content/module-content-view'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/$itemId/')

function ModulesContentPage() {
  return (
    <EditorProvider>
      <ModuleContentViewWrapper />
    </EditorProvider>
  )
}

function ModuleContentViewWrapper() {
  const { editorState } = useEditorState()

  return (
    <ModuleContentView
      moduleContentData={editorState.data}
      editor={editorState.content}
    />
  )
}

export default ModulesContentPage
