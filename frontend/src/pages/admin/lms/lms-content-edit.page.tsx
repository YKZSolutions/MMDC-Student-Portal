import { useAuth } from '@/features/auth/auth.hook'
import Editor from '@/features/lms/components/editor'
import { createLMSAITransport } from '@/features/lms/components/lms-ai-transport'
import { useLMSContentMutations } from '@/features/lms/hooks/use-lms-content-mutations'
import { useSearchState } from '@/hooks/use-search-state'
import { lmsContentControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import { supabase } from '@/integrations/supabase/supabase-client'
import { isEditorEmpty, toBlockArray } from '@/utils/helpers'
import { en } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { createAIExtension } from '@blocknote/xl-ai'
import { en as aiEn } from '@blocknote/xl-ai/locales'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconRubberStamp,
  IconRubberStampOff,
  IconSettings,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { sentenceCase } from 'text-case'
import { Suspense } from 'react'
import {
  ModuleEditActionBarSkeleton,
  ModuleEditContentSkeleton,
  ModuleEditPreviewSkeleton,
} from '@/features/lms/modules/components/module-edit-skeleton'
import { AssignmentConfigCard } from '@/features/lms/modules/components/assignment-config-card'

const route = getRouteApi(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/edit',
)

export default function LMSContentEditPage() {
  return (
    <Box bg="gray.0" mih="100vh">
      <Suspense fallback={<ModuleEditActionBarSkeleton />}>
        <ActionBar />
      </Suspense>
      <Suspense fallback={<ModuleEditContentSkeleton />}>
        <ContentArea />
      </Suspense>
    </Box>
  )
}

function ActionBar() {
  const { search, setSearch } = useSearchState(route)
  const navigate = route.useNavigate()
  const theme = useMantineTheme()

  const { itemId: moduleContentId } = route.useParams()
  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const { handlePublish, handleUnpublish, isPublishing, isUnpublishing } =
    useLMSContentMutations({
      moduleContentId,
    })

  const isPreview = search.view === 'preview'
  const isPublished = !!moduleContentData.publishedAt
  const showConfig = search.showConfig ?? false
  const isAssignment = moduleContentData.contentType === 'ASSIGNMENT'

  const toggleView = () => {
    setSearch({ view: isPreview ? undefined : 'preview' })
  }

  const toggleConfig = () => {
    setSearch({ showConfig: !showConfig })
  }

  const handleTogglePublish = async () => {
    if (isPublished) {
      await handleUnpublish()
    } else {
      await handlePublish()
    }
  }

  return (
    <Paper
      shadow="sm"
      p="md"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Tooltip label="Back to Modules">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => navigate({ to: '/lms/$lmsCode/modules' })}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
            <Divider orientation="vertical" />
            <Stack gap={0}>
              <Group gap="xs">
                <Text fw={600} size="lg">
                  {moduleContentData.title || 'Untitled Content'}
                </Text>
                {!isPublished && (
                  <Badge variant="outline" color="orange" size="xs">
                    Draft
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {sentenceCase(moduleContentData.contentType)}
              </Text>
            </Stack>
          </Group>

          <Group gap="sm">
            <Tooltip label={isPreview ? 'Edit Mode' : 'Preview'}>
              <ActionIcon
                variant="subtle"
                color="primary"
                size="lg"
                onClick={toggleView}
              >
                {isPreview ? <IconEdit size={20} /> : <IconEye size={20} />}
              </ActionIcon>
            </Tooltip>

            {isAssignment && !isPreview && (
              <Tooltip label={showConfig ? 'Hide Config' : 'Show Config'}>
                <ActionIcon
                  variant="subtle"
                  color="primary"
                  size="lg"
                  onClick={toggleConfig}
                >
                  <IconSettings size={20} />
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label={isPublished ? 'Unpublish' : 'Publish'}>
              <ActionIcon
                variant="subtle"
                c="primary"
                size="lg"
                onClick={handleTogglePublish}
                loading={isPublishing || isUnpublishing}
              >
                {isPublished ? (
                  <IconRubberStampOff size={20} />
                ) : (
                  <IconRubberStamp size={20} />
                )}
              </ActionIcon>
            </Tooltip>

            <Button
              variant="filled"
              leftSection={<IconDeviceFloppy size={16} />}
              size="sm"
              // Will be connected in ContentArea
              form="save-content-form"
              type="submit"
            >
              Save Draft
            </Button>
          </Group>
        </Group>
      </Container>
    </Paper>
  )
}

function ContentArea() {
  const { search } = useSearchState(route)
  const { itemId: moduleContentId } = route.useParams()

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const { handleSave, handleUpdateTitle, isUpdating } = useLMSContentMutations({
    moduleContentId,
  })

  const [title, setTitle] = useInputState(moduleContentData.title)
  const showConfig = search.showConfig ?? false
  const isAssignment = moduleContentData.contentType === 'ASSIGNMENT'

  const editor = useCreateBlockNote(
    {
      dictionary: {
        ...en,
        ai: aiEn,
      },
      initialContent: toBlockArray(moduleContentData?.content),
      extensions: [
        createAIExtension({
          transport: createLMSAITransport(),
        }),
      ],
      uploadFile: async (file) => {
        try {
          const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
          if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
            notifications.show({
              title: 'File Too Large',
              message: `File size (${fileSizeMB}MB) exceeds the 25MB limit. Please choose a smaller file.`,
              color: 'red',
            })
            throw new Error(
              `File size exceeds 25MB limit. Current size: ${fileSizeMB}MB`,
            )
          }

          const timestamp = Date.now()
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const filePath = `${moduleContentId}/${timestamp}-${sanitizedFileName}`

          const { error: uploadError } = await supabase.storage
            .from(SupabaseBuckets.LMS_FILES)
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false,
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            notifications.show({
              title: 'Upload Failed',
              message: uploadError.message || 'Failed to upload file',
              color: 'red',
            })
            throw new Error(`Failed to upload file: ${uploadError.message}`)
          }

          const { data } = supabase.storage
            .from(SupabaseBuckets.LMS_FILES)
            .getPublicUrl(filePath)

          notifications.show({
            title: 'Upload Successful',
            message: `File "${file.name}" uploaded successfully`,
            color: 'green',
          })

          return data.publicUrl
        } catch (error) {
          console.error('File upload failed:', error)
          throw error
        }
      },
    },
    [moduleContentId],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const content = editor.document
    await handleSave(
      content,
      title !== moduleContentData.title ? title : undefined,
    )
  }

  const handleTitleBlur = async () => {
    if (title !== moduleContentData.title && title.trim()) {
      await handleUpdateTitle(title)
    }
  }

  return search.view === 'preview' ? (
    <Suspense fallback={<ModuleEditPreviewSkeleton />}>
      <PreviewView
        moduleContentData={moduleContentData}
        title={title}
        editor={editor}
      />
    </Suspense>
  ) : (
    <Container size="xl" py="xl">
      <Grid gutter="lg">
        <Grid.Col
          span={{
            base: 12,
            lg: showConfig && isAssignment ? 8 : 12,
          }}
        >
          <form id="save-content-form" onSubmit={handleSubmit}>
            <Paper withBorder radius="md" bg="white" shadow="sm">
              <Stack gap={0}>
                <Box px={rem(64)} py={'xl'}>
                  <TextInput
                    placeholder="Enter content title..."
                    variant="unstyled"
                    styles={{
                      input: {
                        fontSize: rem(32),
                        fontWeight: 700,
                        color: '#212529',
                        padding: 0,
                        border: 'none',
                        backgroundColor: 'transparent',
                        '&::placeholder': {
                          color: '#adb5bd',
                        },
                        '&:focus': {
                          outline: 'none',
                        },
                      },
                    }}
                    value={title}
                    onChange={setTitle}
                    onBlur={handleTitleBlur}
                    disabled={isUpdating}
                  />
                  <Text size="sm" c="dimmed" mt="xs">
                    {sentenceCase(moduleContentData.contentType)}
                  </Text>
                </Box>
                <Divider />
                <Box py="xl">
                  <Editor editor={editor} />
                </Box>
              </Stack>
            </Paper>
          </form>
        </Grid.Col>
        {showConfig && isAssignment && moduleContentData.assignment && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box
              style={{
                position: 'sticky',
                top: '120px',
              }}
            >
              <AssignmentConfigCard
                assignmentData={moduleContentData.assignment}
              />
            </Box>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  )
}

function PreviewView({
  moduleContentData,
  title,
  editor,
}: {
  moduleContentData: any
  title: string
  editor: any
}) {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Paper withBorder radius="md" p="xl" bg="white">
          <Stack gap="md">
            <Group align="start" gap="sm" justify="space-between">
              <Box>
                <Stack gap={4}>
                  <Text fw={500} c="dimmed" size="sm">
                    {sentenceCase(moduleContentData.contentType)}
                  </Text>
                  <Title order={1} size="h2">
                    {title || moduleContentData.title}
                  </Title>
                </Stack>
              </Box>
            </Group>
          </Stack>
        </Paper>
        <Paper withBorder radius="md" py="xl" bg="white">
          {!isEditorEmpty(editor) ? (
            <BlockNoteView editor={editor} theme="light" editable={false} />
          ) : (
            <Box py="xl">
              <Text c="dimmed" fs="italic" px={'xl'} ta="center">
                No content available for this item.
              </Text>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  )
}
