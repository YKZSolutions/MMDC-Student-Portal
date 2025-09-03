import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  type ModalProps,
  Paper,
  Popover,
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
  FileCaptionButton,
  FileDeleteButton,
  FileDownloadButton,
  FileRenameButton,
  FileReplaceButton,
  FormattingToolbar,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useBlockNoteEditor,
  useComponentsContext,
  useCreateBlockNote,
  useEditorChange,
} from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import {
  IconArrowBack,
  IconArrowForwardUp,
  IconEdit,
  IconEye,
  IconLink,
} from '@tabler/icons-react'
import { mockInitialContentString } from '@/features/courses/mocks.ts'

interface EditorWithPreviewProps {
  content: string | null
  onUpdate?: (content: string) => void
}

const EditorWithPreview = ({ content, onUpdate }: EditorWithPreviewProps) => {
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
                <Group gap={0}>
                  <RedoButton key={'redoButton'} />
                  <UndoButton key={'undoButton'} />
                </Group>
                <Divider orientation="vertical" />
                <Group gap={2}>
                  <BlockTypeSelect key={'blockTypeSelect'} />
                  <FileDeleteButton key={'deleteFileButton'} />
                  <FileDownloadButton key={'downloadFileButton'} />
                </Group>
                <Divider orientation="vertical" />
                <Group gap={2}>
                  <FileRenameButton key={'renameFileButton'} />
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
                  <CustomCreateLinkButton key={'createLinkButton'} />
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
                mt={'xl'}
              >
                {isPreviewMode ? (
                  <Preview content={previewContent} />
                ) : (
                  <BlockNoteViewEditor />
                )}
              </Box>
            </Box>
          </ScrollArea>
        </Stack>
      </BlockNoteView>
    </Box>
  )
}

export function CustomCreateLinkButton() {
  const editor = useBlockNoteEditor()
  const Components = useComponentsContext()!
  const [opened, setOpened] = useState(false)
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    if (!url) return
    editor.createLink(url)
    setOpened(false)
    setUrl('')
  }

  return (
    <Components.Generic.Popover.Root opened={opened}>
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          mainTooltip="Create link"
          onClick={() => setOpened((o) => !o)}
          icon={<IconLink size={16} />}
          label={'Link'}
        ></Components.FormattingToolbar.Button>
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content
        variant={'panel-popover'}
        className={'bn-form-popover'}
      >
        <Components.Generic.Form.TextInput
          name="url"
          variant={'default'}
          icon={<IconLink size={16} />}
          placeholder="Enter URL"
          value={url}
          autoFocus={true}
          onChange={(e) => setUrl(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') setOpened(false)
          }}
        />
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  )
}

const Preview = ({ content }: { content: string }) => {
  return (
    <Box
      style={{
        width: '100%',
        maxWidth: '1080px',
        minWidth: '300px',
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    ></Box>
  )
}

const UndoButton = () => {
  const editor = useBlockNoteEditor()
  const Components = useComponentsContext()!

  return (
    <Components.FormattingToolbar.Button
      mainTooltip="Undo last action"
      onClick={() => editor.undo()}
      icon={<IconArrowBack size={16} />}
      label={'Undo'}
    ></Components.FormattingToolbar.Button>
  )
}

const RedoButton = () => {
  const editor = useBlockNoteEditor()
  const Components = useComponentsContext()!

  return (
    <Components.FormattingToolbar.Button
      mainTooltip="Redo last action"
      onClick={() => editor.redo()}
      icon={<IconArrowForwardUp size={16} transform="rotate(180deg)" />}
      label={'Redo'}
    />
  )
}

type ModeToggleButtonProps = {
  isPreviewMode: boolean
  onToggle: () => void
}

const ModeToggleButton = ({
  isPreviewMode,
  onToggle,
}: ModeToggleButtonProps) => {
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
