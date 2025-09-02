import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  type ModalProps,
  Paper,
  ScrollArea,
  Stack,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import {
  BasicTextStyleButton,
  BlockNoteViewEditor,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useComponentsContext,
  useCreateBlockNote,
  useEditorChange,
} from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { mockInitialContent } from '@/features/courses/mocks.ts'
import { IconEdit, IconEye } from '@tabler/icons-react'

interface EditorWithPreviewProps {
  content: string
  onUpdate?: (content: string) => void
}

const EditorWithPreview = ({ content, onUpdate }: EditorWithPreviewProps) => {
  const mockInitialContentString = JSON.stringify(mockInitialContent)

  const editor = useCreateBlockNote({
    initialContent: JSON.parse(mockInitialContentString),
  })

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>('')

  useEffect(() => {
    if (!isPreviewMode) return
    // Convert to HTML for preview

    const updatePreview = async () => {
      const html = await editor.blocksToFullHTML(editor.document)
      setPreviewContent(html)
    }

    updatePreview()
  }, [isPreviewMode])

  useEditorChange((editor) => {
    const updateContent = async () => {
      // Save to JSON for saving
      const jsonObject = JSON.stringify(editor.document)

      // Save to database
      onUpdate?.(jsonObject)
    }
  }, editor)

  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      pb={'xl'}
    >
      <BlockNoteView
        editor={editor}
        theme={'light'}
        renderEditor={false}
        formattingToolbar={false}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack align={'center'} style={{ height: '100%', width: '100%' }}>
          <Paper
            radius={0}
            p="0.25rem"
            display={'flex'}
            className="rt-header"
            withBorder
            style={{
              flexShrink: 0,
              width: '100%',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
            }}
          >
            <FormattingToolbar>
              <Group gap={12} align="center">
                <BlockTypeSelect key={'blockTypeSelect'} />
                <Divider orientation="vertical" />
                <Group gap={2}>
                  <FileCaptionButton key={'fileCaptionButton'} />
                  <FileReplaceButton key={'replaceFileButton'} />
                  <ColorStyleButton key={'colorStyleButton'} />
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
                  <BasicTextStyleButton
                    key={'codeStyleButton'}
                    basicTextStyle={'code'}
                  />
                  <CreateLinkButton key={'createLinkButton'} />
                </Group>
                <Divider orientation="vertical" />
                <Group gap={2}>
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
                  <TextAlignButton
                    textAlignment={'justify'}
                    key={'textAlignJustifyButton'}
                  />
                </Group>
                <Divider orientation="vertical" />
                <Group gap={2}>
                  <NestBlockButton key={'nestBlockButton'} />
                  <UnnestBlockButton key={'unnestBlockButton'} />
                </Group>
                <Divider orientation="vertical" />
                <ModeToggleButton
                  key={'modeToggleButton'}
                  onToggle={() => setIsPreviewMode(!isPreviewMode)}
                  isPreviewMode={isPreviewMode}
                />
              </Group>
            </FormattingToolbar>
          </Paper>

          <ScrollArea
            w={'100%'}
            type="scroll"
            style={{
              flex: 1,
              minHeight: 0,
            }}
          >
            <Box
              style={{
                minHeight: '90%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  width: '80%',
                  maxWidth: '1080px',
                  minWidth: '300px',
                }}
              >
                <BlockNoteViewEditor />
              </Box>
            </Box>
          </ScrollArea>
        </Stack>
      </BlockNoteView>
    </Box>
  )
}

type ModeToggleButtonProps = {
  isPreviewMode: boolean
  onToggle: () => void
}

export function ModeToggleButton({
  isPreviewMode,
  onToggle,
}: ModeToggleButtonProps) {
  const Components = useComponentsContext()!

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={
        !isPreviewMode ? 'Switch to Preview Mode' : 'Switch to Edit Mode'
      }
      onClick={() => onToggle()}
      icon={isPreviewMode ? <IconEdit size={16} /> : <IconEye size={16} />}
      label={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
    ></Components.FormattingToolbar.Button>
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
              <EditorWithPreview content={editorContent} />
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
