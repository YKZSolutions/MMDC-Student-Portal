import { Button, Container, Group, Title, useMantineTheme } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import type { ContentNode, ContentNodeType, } from '@/features/courses/modules/types.ts'
import CourseTree from '@/features/courses/course-editor/course-tree.tsx'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ContentDetailsEditor from '@/features/courses/course-editor/content-details-editor.tsx'
import { useState } from 'react'

interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  mode: 'create' | 'edit'
}

const ModuleCreationCard = () => {
  const theme = useMantineTheme()
  const [editorState, setEditorState] = useState<EditorState>({
    type: 'module',
    data: null,
    parentId: null,
    mode: 'create',
  })
  const [rightPaneOpen, setRightPaneOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleAdd = (parentId: string = 'root', newType?: ContentNodeType) => {
    setEditorState({
      type: newType || 'module',
      data: null,
      parentId,
      mode: 'create',
    })

    setRightPaneOpen(true)
  }

  const handleEdit = (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: any,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      mode: 'edit',
    })

    setRightPaneOpen(true)
  }

  const handleSave = (data: any) => {
    console.log('Saving data:', data)
    // TODO: update state or make an API call
    // For now, we'll just close the editor
    setEditorState((prev) => ({ ...prev, data: null }))
  }

  const handleClose = () => {
    setRightPaneOpen(false)
  }

  return (
    <PanelGroup direction="horizontal">
      <Panel minSize={30}>
        <Container h={'100%'} p={'xl'}>
          <Group justify="space-between" align="center" mb="md">
            <Title order={4}>Course Structure</Title>
            <Button
              variant="default"
              radius={'md'}
              leftSection={<IconPlus size={18} />}
              onClick={() => handleAdd()}
            >
              Add Module
            </Button>
          </Group>

          <CourseTree
            onAddButtonClick={handleAdd}
            onEditButtonClick={handleEdit}
          />
        </Container>
      </Panel>
      <PanelResizeHandle disabled={!rightPaneOpen} onDragging={setIsDragging} />
      <Panel
        defaultSize={30}
        minSize={25}
        hidden={!rightPaneOpen}
        style={{
          borderLeft: `1px solid ${rightPaneOpen ? (isDragging ? theme.colors.blue[5] : theme.colors.gray[3]) : 'transparent'}`,
          boxShadow: `0px 8px 24px 0px ${theme.colors.gray[5]}`,
        }}
      >
        <ContentDetailsEditor
          opened={rightPaneOpen}
          type={editorState.type}
          data={editorState.data}
          mode={editorState.mode}
          onClose={handleClose}
          onSave={handleSave}
          gap="lg"
          h="100%"
          p="lg"
          m={'xs'}
          style={{
            overflowY: 'auto',
            scrollbarGutter: 'stable',
          }}
        />
      </Panel>
    </PanelGroup>
  )
}

export default ModuleCreationCard
