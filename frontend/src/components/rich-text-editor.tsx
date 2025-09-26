import type { BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  FileCaptionButton,
  FileDeleteButton,
  FileDownloadButton,
  FileRenameButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useBlockNoteEditor,
  useComponentsContext,
} from '@blocknote/react'
import { Box, Divider, Group, Paper, Stack } from '@mantine/core'
import {
  IconArrowBack,
  IconArrowForwardUp,
  IconEdit,
  IconEye,
  IconLink,
} from '@tabler/icons-react'
import { useState } from 'react'

interface RichTextEditorProps {
  editor: BlockNoteEditor
}

const RichTextEditor = ({ editor }: RichTextEditorProps) => {
  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      py={'xl'}
    >
      <BlockNoteView
        editor={editor}
        theme={'light'}
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
            // withBorder
            // style={{
            //   flexShrink: 0,
            //   width: '100%',
            //   borderTop: 'none',
            //   borderLeft: 'none',
            //   borderRight: 'none',
            // }}
          >
            <FormattingToolbarController
              formattingToolbar={() => (
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
                    {/* <ModeToggleButton
                  key={'modeToggleButton'}
                  onToggle={() => setIsPreviewMode(!isPreviewMode)}
                  isPreviewMode={isPreviewMode}
                /> */}
                  </Group>
                </FormattingToolbar>
              )}
            />
          </Paper>

          {/* <ScrollArea
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
              <BlockNoteViewEditor />
            </Box>
          </Box>
        </ScrollArea> */}
        </Stack>
      </BlockNoteView>
    </Box>
  )
}

function CustomCreateLinkButton() {
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

export default RichTextEditor
