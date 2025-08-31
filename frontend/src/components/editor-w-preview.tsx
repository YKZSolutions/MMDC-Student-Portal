import {
  Button,
  Container,
  Divider,
  Group,
  Modal,
  type ModalProps,
  Paper,
  Stack,
  Tabs,
  Title,
} from '@mantine/core'
import { IconEdit, IconEye } from '@tabler/icons-react'
import { useState } from 'react'
// import { useCreateBlockNote, useEditorChange } from '@blocknote/react'
// import { BlockNoteView } from '@blocknote/mantine'
// import type { Block } from '@blocknote/core'

interface EditorWithPreviewProps {
  content: string
  onChange: (content: string) => void
}

// const mockInitialContent: Block[] = [
//   {
//     id: 'block-1',
//     type: 'paragraph',
//     props: {
//       textColor: 'default',
//       backgroundColor: 'default',
//       textAlignment: 'left',
//     },
//     content: [
//       {
//         type: 'text',
//         text: 'Hello! This is the initial content.',
//         styles: {},
//       },
//     ],
//     children: [],
//   },
// ]

const EditorWithPreview = async ({
  content,
  onChange,
}: EditorWithPreviewProps) => {
  // const mockInitialContentString = JSON.stringify(mockInitialContent)
  //
  // const editor = useCreateBlockNote()
  //
  // const [previewContent, setPreviewContent] = useState<string>('')
  //
  // useEditorChange(async (editor) => {
  //   // 1. Get JSON blocks
  //   const savedBlocks = editor.document
  //
  //   // 2. Convert to HTML for preview
  //   const html = await editor.blocksToFullHTML(savedBlocks)
  //
  //   // 3. Save Convert to JSON for saving
  //   const jsonObject = JSON.stringify(savedBlocks)
  //
  //   setPreviewContent(html)
  //   // Save to database
  //   onChange?.(jsonObject)
  // }, editor)

  return (
    <Tabs defaultValue="edit" h={'100%'}>
      <Tabs.List>
        <Tabs.Tab value="edit" leftSection={<IconEdit size={14} />}>
          Edit
        </Tabs.Tab>
        <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
          Preview
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="edit">
        <Container size={'xl'} p={'xl'}>
          {/*<BlockNoteView editor={editor} />*/}
        </Container>
      </Tabs.Panel>

      <Tabs.Panel
        value="preview"
        style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
      >
        <Paper shadow="xs" p="md" style={{ height: '100%', overflow: 'auto' }}>
          {/*<div className="prose max-w-none">{previewContent}</div>*/}
        </Paper>
      </Tabs.Panel>
    </Tabs>
  )
}

type EditorWithPreviewModalProps = ModalProps & EditorWithPreviewProps

const EditorWithPreviewModal = ({
  content,
  onChange,
  ...modalProps
}: EditorWithPreviewModalProps) => {
  const [editorContent, setEditorContent] = useState(content)
  return (
    <Modal.Root size={'xl'} {...modalProps}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Stack flex={1}>
            <Group>
              <Modal.Title fz={'md'} fw={500}>
                Edit Content
              </Modal.Title>
              <Modal.CloseButton />
            </Group>
            <Title ta={'center'}>Course Name</Title>
          </Stack>
        </Modal.Header>
        <Modal.Body
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '70vh',
            overflow: 'hidden',
          }}
        >
          <Stack
            style={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Stack flex={'1 0 auto'}>
              <Divider></Divider>
              <Group justify="space-between">
                <Button
                  variant="default"
                  onClick={modalProps.onClose}
                  radius={'md'}
                  size={'sm'}
                >
                  Cancel
                </Button>
                <Button radius={'md'} size={'sm'}>
                  Save
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

export { EditorWithPreview, EditorWithPreviewModal }
