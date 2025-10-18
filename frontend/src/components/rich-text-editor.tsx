import type { BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
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
                // style={{
                //   flexShrink: 0,
                //   width: '100%',
                //   borderTop: 'none',
                //   borderLeft: 'none',
                //   borderRight: 'none',
                // }}
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
                  </Group>
                </FormattingToolbar>
              </Paper>
            )}
          />

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

export default RichTextEditor
