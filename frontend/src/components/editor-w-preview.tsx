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
import {
  BasicTextStyleButton,
  BlockNoteViewEditor,
  BlockTypeSelect,
  ColorStyleButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useCreateBlockNote,
  useEditorChange,
} from '@blocknote/react'
import type { Block } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'

interface EditorWithPreviewProps {
  content: string
  onChange: (content: string) => void
}

const mockInitialContent: Block[] = [
  {
    id: 'block-1',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Hello! This is the initial content.',
        styles: {},
      },
    ],
    children: [],
  },
]

const EditorWithPreview = ({ content, onChange }: EditorWithPreviewProps) => {
  const mockInitialContentString = JSON.stringify(mockInitialContent)

  const editor = useCreateBlockNote({
    initialContent: JSON.parse(mockInitialContentString),
  })

  const [previewContent, setPreviewContent] = useState<string>('')

  useEditorChange((editor) => {
    ;(async () => {
      // 1. Get JSON blocks
      const savedBlocks = editor.document

      // 2. Convert to HTML for preview
      const html = await editor.blocksToFullHTML(savedBlocks)

      // 3. Save Convert to JSON for saving
      const jsonObject = JSON.stringify(savedBlocks)

      setPreviewContent(html)
      // Save to database
      onChange?.(jsonObject)
    })()
  }, editor)

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
          <BlockNoteView editor={editor} theme={'light'} renderEditor={false}>
            <Stack gap={'md'}>
              <FormattingToolbarController
                formattingToolbar={() => (
                  <FormattingToolbar>
                    <BlockTypeSelect key={'blockTypeSelect'} />
                    <FileCaptionButton key={'fileCaptionButton'} />
                    <FileReplaceButton key={'replaceFileButton'} />
                    <BasicTextStyleButton
                      basicTextStyle={'bold'}
                      key={'boldStyleButton'}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={'italic'}
                      key={'italicStyleButton'}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={'underline'}
                      key={'underlineStyleButton'}
                    />
                    <BasicTextStyleButton
                      basicTextStyle={'strike'}
                      key={'strikeStyleButton'}
                    />
                    {/* Extra button to toggle code styles */}
                    <BasicTextStyleButton
                      key={'codeStyleButton'}
                      basicTextStyle={'code'}
                    />
                    <TextAlignButton
                      textAlignment={'left'}
                      key={'textAlignLeftButton'}
                    />
                    <TextAlignButton
                      textAlignment={'center'}
                      key={'textAlignCenterButton'}
                    />
                    <TextAlignButton
                      textAlignment={'right'}
                      key={'textAlignRightButton'}
                    />
                    <ColorStyleButton key={'colorStyleButton'} />
                    <NestBlockButton key={'nestBlockButton'} />
                    <UnnestBlockButton key={'unnestBlockButton'} />
                  </FormattingToolbar>
                )}
              />
              <Paper
                withBorder
                p="4px"
                display={'flex'}
                flex={1}
                className="rt-header"
              >
                <FormattingToolbar>
                  <BlockTypeSelect key={'blockTypeSelect'} />
                  <FileCaptionButton key={'fileCaptionButton'} />
                  <FileReplaceButton key={'replaceFileButton'} />
                  <BasicTextStyleButton
                    basicTextStyle={'bold'}
                    key={'boldStyleButton'}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={'italic'}
                    key={'italicStyleButton'}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={'underline'}
                    key={'underlineStyleButton'}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={'strike'}
                    key={'strikeStyleButton'}
                  />
                  {/* Extra button to toggle code styles */}
                  <BasicTextStyleButton
                    key={'codeStyleButton'}
                    basicTextStyle={'code'}
                  />
                  <TextAlignButton
                    textAlignment={'left'}
                    key={'textAlignLeftButton'}
                  />
                  <TextAlignButton
                    textAlignment={'center'}
                    key={'textAlignCenterButton'}
                  />
                  <TextAlignButton
                    textAlignment={'right'}
                    key={'textAlignRightButton'}
                  />
                  <ColorStyleButton key={'colorStyleButton'} />
                  <NestBlockButton key={'nestBlockButton'} />
                  <UnnestBlockButton key={'unnestBlockButton'} />
                </FormattingToolbar>
              </Paper>
              <BlockNoteViewEditor />
            </Stack>
          </BlockNoteView>
        </Container>
      </Tabs.Panel>

      <Tabs.Panel
        value="preview"
        style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
      >
        <Paper shadow="xs" p="md" style={{ height: '100%', overflow: 'auto' }}>
          <div className="prose max-w-none">{previewContent}</div>
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
              <EditorWithPreview content={editorContent} onChange={onChange} />
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

EditorWithPreviewModal.displayName = 'EditorWithPreviewModal'

export { EditorWithPreview, EditorWithPreviewModal }
