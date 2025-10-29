import { BlockNoteView } from '@blocknote/mantine'
import {
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react'
import {
  AIMenuController,
  AIToolbarButton,
  getAISlashMenuItems,
} from '@blocknote/xl-ai'
import { Divider, Group, Paper, Stack } from '@mantine/core'
import type { BlockNoteEditor } from '@blocknote/core'
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  FileCaptionButton,
  FileDeleteButton,
  FileDownloadButton,
  FileRenameButton,
  FileReplaceButton,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useBlockNoteEditor,
  useComponentsContext,
} from '@blocknote/react'
import {
  IconArrowBack,
  IconArrowForwardUp,
  IconLink,
} from '@tabler/icons-react'
import { useState } from 'react'

interface EditorOptions {
  editor: BlockNoteEditor
}

export default function Editor({ editor }: EditorOptions) {
  return (
    <BlockNoteView
      editor={editor}
      theme={'light'}
      formattingToolbar={false}
      slashMenu={false}
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar />

      <AIMenuController />

      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) => {
          const defaultItems = getDefaultReactSlashMenuItems(editor)
          const aiItems = getAISlashMenuItems(editor)
          const allItems = [...defaultItems, ...aiItems]

          if (!query) return allItems

          return allItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          )
        }}
      />
    </BlockNoteView>
  )
}

function Toolbar() {
  return (
    <Stack align={'center'} style={{ height: '100%', width: '100%' }}>
      <FormattingToolbarController
        floatingOptions={{
          placement: 'top',
        }}
        formattingToolbar={() => (
          <Paper
            radius={'md'}
            p="0.25rem"
            display={'flex'}
            className="rt-header"
            withBorder
          >
            <FormattingToolbar>
              <Group gap={12} align="center">
                <Group gap={0}>
                  <RedoButton key={'redoButton'} />
                  <UndoButton key={'undoButton'} />
                </Group>
                <Divider orientation="vertical" />
                {/* AI toolbar button from xl-ai */}
                <AIToolbarButton key={'aiToolbarButton'} />
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
              </Group>
            </FormattingToolbar>
          </Paper>
        )}
      />
    </Stack>
  )
}

function UndoButton() {
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

function RedoButton() {
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
