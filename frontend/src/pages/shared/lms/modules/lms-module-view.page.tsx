import {
  lmsContentControllerCreateContentProgressMutation,
  lmsContentControllerFindOneOptions,
  lmsContentControllerFindOneQueryKey,
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindModuleTreeQueryKey,
  lmsControllerGetModuleProgressOverviewOptions,
  lmsControllerGetModuleProgressOverviewQueryKey,
  assignmentControllerFindOneForStudentOptions,
  assignmentControllerFindOneForStudentQueryKey,
  assignmentControllerSubmitMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { isEditorEmpty, toBlockArray } from '@/utils/helpers'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import {
  Badge,
  Box,
  Progress,
  rem,
  Text,
  Timeline,
  Title,
  useMantineTheme,
  Card,
  InputBase,
  FileInput,
  Textarea,
  TextInput,
  ActionIcon,
} from '@mantine/core'
import {
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
} from '@mantine/core'
import {
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconFileText,
  IconLink,
  IconUpload,
  IconTrash,
  IconPlus,
  IconFile,
  IconCalendar,
  IconClock,
  IconTrophy,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useCanGoBack, useRouter } from '@tanstack/react-router'
import { sentenceCase } from 'text-case'
import { Suspense, useMemo, useState, useEffect } from 'react'
import type { ModuleTreeSectionDto } from '@/integrations/api/client'
import { useAuth } from '@/features/auth/auth.hook'
import RoleComponentManager from '@/components/role-component-manager'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { toastMessage } from '@/utils/toast-message'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useMediaQuery } from '@mantine/hooks'
import {
  ModuleViewHeaderSkeleton,
  ModuleViewContentSkeleton,
  ModuleViewProgressSkeleton,
  ModuleViewNavigationSkeleton,
} from '@/features/lms/modules/components/module-view-skeleton'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/$itemId/')

export default function LMSModuleViewPage() {
  const navigate = route.useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const [showProgress, setShowProgress] = useState(false)

  const {
    authUser: { role },
  } = useAuth('protected')

  return (
    <Container size="lg" w={'100%'} py="xl" pt={'lg'}>
      {/* Main Content Area */}
      <Stack flex={1}>
        <Group justify="space-between" align="center">
          <Button
            variant="default"
            radius={'md'}
            maw={'fit-content'}
            leftSection={<IconChevronLeft size={16} />}
            onClick={() =>
              canGoBack
                ? router.history.back({})
                : navigate({
                    to: '/lms/$lmsCode/modules',
                  })
            }
          >
            Back to Modules
          </Button>

          <RoleComponentManager
            currentRole={role}
            roleRender={{
              student: (
                <Button
                  variant="light"
                  radius={'md'}
                  size="sm"
                  leftSection={
                    showProgress ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )
                  }
                  onClick={() => setShowProgress(!showProgress)}
                >
                  {showProgress ? 'Hide' : 'Show'} Progress
                </Button>
              ),
            }}
          />
        </Group>

        {/* Header Section */}
        <Grid>
          <Grid.Col
            span={{
              base: 12,
              lg: showProgress ? 8.5 : 12,
            }}
          >
            <Stack flex={1}>
              <Suspense fallback={<ModuleViewHeaderSkeleton />}>
                <HeaderSection />
              </Suspense>
              <Suspense fallback={<ModuleViewContentSkeleton />}>
                <ContentArea />
              </Suspense>
              <RoleComponentManager
                currentRole={role}
                roleRender={{
                  student: (
                    <Suspense fallback={<ModuleViewContentSkeleton />}>
                      <SubmissionCardWrapper />
                    </Suspense>
                  ),
                }}
              />
            </Stack>
          </Grid.Col>

          {showProgress && (
            <Grid.Col
              span={{
                base: 12,
                lg: 3.5,
              }}
            >
              <RoleComponentManager
                currentRole={role}
                roleRender={{
                  student: (
                    <Suspense fallback={<ModuleViewProgressSkeleton />}>
                      <ProgressCard />
                    </Suspense>
                  ),
                }}
              />

              {/* {user.role === 'admin' &&
              moduleContentData?.contentType === 'ASSIGNMENT' && (
                <AssignmentConfigCard
                  assignmentData={moduleContentData.assignment}
                />
              )} */}
            </Grid.Col>
          )}
        </Grid>

        <Divider my={'lg'} mb={'md'} />

        <Suspense fallback={<ModuleViewNavigationSkeleton />}>
          <ContentNavigation />
        </Suspense>
      </Stack>
    </Container>
  )
}

function HeaderSection() {
  const {
    authUser: { role },
  } = useAuth('protected')

  const { itemId: moduleContentId } = route.useParams()

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const isPublished = !!moduleContentData.publishedAt
  const assignment =
    moduleContentData.contentType === 'ASSIGNMENT'
      ? moduleContentData.assignment
      : null
  const dueDate =
    assignment?.dueDate && !isNaN(new Date(assignment.dueDate).getTime())
      ? new Date(assignment.dueDate)
      : null
  const isOverdue = dueDate && new Date() > dueDate

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="md">
        <Group align="start" gap="sm" justify="space-between">
          <Box>
            <Stack gap={0}>
              <Text fw={500} c="dimmed">
                {sentenceCase(moduleContentData.contentType)}
              </Text>
              <Title order={1} size="h2">
                {moduleContentData.title}
              </Title>
              {dueDate && (
                <Group gap="xs" mt="xs">
                  <IconCalendar size={16} />
                  <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
                    Due:{' '}
                    {dueDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {isOverdue && ' (Overdue)'}
                  </Text>
                </Group>
              )}
            </Stack>
            <Group gap="xs">
              {role !== 'student' && (
                <Badge variant="light" color={isPublished ? 'green' : 'red'}>
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              )}
            </Group>
          </Box>

          <Group>
            <RoleComponentManager
              currentRole={role}
              roleRender={{
                student: <MarkCompleteButton />,
              }}
            />
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
}

function MarkCompleteButton() {
  const { lmsCode: moduleId, itemId: moduleContentId } = route.useParams()

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const isDone =
    moduleContentData.studentProgress &&
    moduleContentData.studentProgress.length > 0 &&
    moduleContentData.studentProgress.every((p) => p.status === 'COMPLETED')

  const { mutateAsync: markAsDone } = useAppMutation(
    lmsContentControllerCreateContentProgressMutation,
    toastMessage('content', 'marking', 'marked as done'),
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: lmsContentControllerFindOneQueryKey({
            path: { moduleContentId },
          }),
        })

        queryClient.invalidateQueries({
          queryKey: lmsControllerGetModuleProgressOverviewQueryKey({
            path: { id: moduleId },
          }),
        })

        queryClient.invalidateQueries({
          queryKey: lmsControllerFindModuleTreeQueryKey({
            path: { id: moduleId },
          }),
        })
      },
    },
  )

  return (
    <Button
      variant={isDone ? 'filled' : 'outline'}
      color={isDone ? 'green' : 'blue'}
      leftSection={
        isDone ? <IconCheck size={16} /> : <IconBookmark size={16} />
      }
      onClick={() => {
        if (isDone) return
        markAsDone({
          path: {
            moduleId,
            moduleContentId,
          },
        })
      }}
    >
      {isDone ? 'Completed' : 'Mark Complete'}
    </Button>
  )
}

function ContentArea() {
  const { itemId: moduleContentId } = route.useParams()

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  const editor = useCreateBlockNote(
    {
      initialContent: toBlockArray(moduleContentData?.content),
    },
    [moduleContentId],
  )

  return (
    <Stack>
      <Paper withBorder radius="md" py="xl">
        {!isEditorEmpty(editor) ? (
          <BlockNoteView editor={editor} theme="light" editable={false} />
        ) : (
          <Text c="dimmed" fs="italic" px={'xl'}>
            No content available for this item.
          </Text>
        )}
      </Paper>
    </Stack>
  )
}

interface SubmissionContent {
  blocknoteContent?: any[]
  embedded?: Array<{
    type: 'link' | 'file'
    content: string
    name?: string
  }>
}

interface EmbeddedItem {
  id: string
  type: 'link' | 'file'
  content: string | File
  name?: string
}

function SubmissionCardWrapper() {
  const { itemId: moduleContentId } = route.useParams()

  const { data: moduleContentData } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId },
    }),
  )

  // Only render SubmissionCard for assignments
  if (
    moduleContentData.contentType !== 'ASSIGNMENT' ||
    !moduleContentData.assignment
  ) {
    return null
  }

  return <SubmissionCard />
}

function SubmissionCard() {
  const { itemId: moduleContentId } = route.useParams()

  // Fetch assignment details with submissions for students
  const { data: assignment } = useSuspenseQuery(
    assignmentControllerFindOneForStudentOptions({
      path: { moduleContentId },
    }),
  )

  const editor = useCreateBlockNote({}, [moduleContentId])
  const [embeddedItems, setEmbeddedItems] = useState<EmbeddedItem[]>([])
  const [hasEditorContent, setHasEditorContent] = useState(false)

  // Reset embedded items when navigating to a different assignment
  useEffect(() => {
    setEmbeddedItems([])
  }, [moduleContentId])

  // Track editor content changes
  useEffect(() => {
    if (!editor) return

    const updateContentState = () => {
      setHasEditorContent(!isEditorEmpty(editor))
    }

    // Check initial state
    updateContentState()

    // Subscribe to editor changes
    editor.onEditorContentChange(updateContentState)
  }, [editor, moduleContentId])

  const submitted = assignment.submissions.length > 0
  const graded =
    submitted &&
    assignment.submissions[0].grade !== null &&
    assignment.submissions[0].grade !== undefined

  // Parse submission content if it exists
  const submissionContent =
    assignment.submissions.length > 0 && assignment.submissions[0].content
      ? Array.isArray(assignment.submissions[0].content)
        ? (assignment.submissions[0].content[0] as SubmissionContent)
        : (assignment.submissions[0].content as unknown as SubmissionContent)
      : undefined

  // Create editor for viewing submitted content
  const submittedEditor = useCreateBlockNote(
    {
      initialContent:
        submissionContent?.blocknoteContent &&
        submissionContent.blocknoteContent.length > 0
          ? submissionContent.blocknoteContent
          : undefined,
      editable: false,
    },
    [moduleContentId, submissionContent?.blocknoteContent],
  )

  const { mutateAsync: submitAssignment, isPending } = useAppMutation(
    assignmentControllerSubmitMutation,
    toastMessage('assignment', 'submitting', 'submitted'),
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: assignmentControllerFindOneForStudentQueryKey({
            path: { moduleContentId },
          }),
        })

        // Reset form
        setEmbeddedItems([])
        if (editor) {
          editor.removeBlocks(editor.document)
        }
      },
    },
  )

  const addEmbeddedItem = (type: 'link' | 'file') => {
    setEmbeddedItems([
      ...embeddedItems,
      {
        id: crypto.randomUUID(),
        type,
        content: '',
      },
    ])
  }

  const removeEmbeddedItem = (id: string) => {
    setEmbeddedItems(embeddedItems.filter((item) => item.id !== id))
  }

  const updateEmbeddedItem = (
    id: string,
    content: string | File,
    name?: string,
  ) => {
    setEmbeddedItems(
      embeddedItems.map((item) =>
        item.id === id ? { ...item, content, name } : item,
      ),
    )
  }

  const handleSubmit = () => {
    // Wrap everything in an array with a single object to maintain backward compatibility
    const contentWrapper = {
      blocknoteContent: editor.document,
      embedded: embeddedItems
        .filter((item) => item.content)
        .map((item) => ({
          type: item.type,
          content:
            item.type === 'file' && item.content instanceof File
              ? '' // TODO: Upload file and get URL
              : (item.content as string),
          name: item.name,
        })),
    }

    submitAssignment({
      path: { assignmentId: assignment.id },
      body: {
        state: 'SUBMITTED',
        content: [contentWrapper] as any,
      },
    })
  }

  const canSubmit =
    hasEditorContent || embeddedItems.some((item) => item.content)

  return (
    <Card withBorder radius="md" p="lg">
      <Stack>
        <Group justify="space-between">
          <Text fw={700}>Submission</Text>
          <Group gap="xs">
            {graded ? (
              <>
                <Badge color="green">Graded</Badge>
                {assignment.submissions[0].grade && (
                  <Badge color="primary" size="lg" variant="filled">
                    <Text fw={700} size="md">
                      {assignment.submissions[0].grade.finalScore}/
                      {assignment.maxScore}
                    </Text>
                  </Badge>
                )}
              </>
            ) : submitted ? (
              <Badge color="primary">Submitted</Badge>
            ) : (
              <Badge color="red" variant="light">
                Not Submitted
              </Badge>
            )}
          </Group>
        </Group>

        {!submitted ? (
          <Stack gap="md">
            {/* BlockNote Editor */}
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Content
              </Text>
              <Paper withBorder p="md" radius="md">
                <BlockNoteView
                  editor={editor}
                  theme="light"
                  style={{ minHeight: '200px' }}
                  editable={!isPending}
                />
              </Paper>
            </Stack>
            <Divider />
            {/* Embedded Items (Links & Files) */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Attachments
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconLink size={14} />}
                    onClick={() => addEmbeddedItem('link')}
                    disabled={isPending}
                  >
                    Add Link
                  </Button>
                  {/* <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconUpload size={14} />}
                    onClick={() => addEmbeddedItem('file')}
                    disabled={isPending}
                  >
                    Add File
                  </Button> */}
                </Group>
              </Group>

              {embeddedItems.length > 0 && (
                <Stack gap="sm">
                  {embeddedItems.map((item) => (
                    <Paper key={item.id} withBorder p="sm" radius="md">
                      <Group gap="sm">
                        {item.type === 'link' ? (
                          <TextInput
                            placeholder="https://example.com/your-work"
                            leftSection={<IconLink size={16} />}
                            value={item.content as string}
                            onChange={(e) =>
                              updateEmbeddedItem(item.id, e.target.value)
                            }
                            disabled={isPending}
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <FileInput
                            placeholder="Select file"
                            leftSection={<IconFile size={16} />}
                            value={item.content as File | null}
                            onChange={(file) =>
                              updateEmbeddedItem(item.id, file!, file?.name)
                            }
                            disabled={isPending}
                            style={{ flex: 1 }}
                          />
                        )}
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => removeEmbeddedItem(item.id)}
                          disabled={isPending}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>

            <Group justify="flex-end">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
                loading={isPending}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="md">
            {/* Display BlockNote Content */}
            {submissionContent?.blocknoteContent &&
              submissionContent.blocknoteContent.length > 0 && (
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Submitted Content
                  </Text>
                  <Paper withBorder p="md" radius="md">
                    <BlockNoteView
                      editor={submittedEditor}
                      theme="light"
                      editable={false}
                    />
                  </Paper>
                </Stack>
              )}

            {/* Display Embedded Links & Files */}
            {submissionContent?.embedded &&
              submissionContent.embedded.length > 0 && (
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Attachments
                  </Text>
                  {submissionContent.embedded.map((item, index) => (
                    <Paper key={index} withBorder p="sm" radius="md">
                      {item.type === 'link' ? (
                        <a
                          href={item.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Group gap="sm">
                            <IconLink size={20} />
                            <Text c="blue" style={{ wordBreak: 'break-all' }}>
                              {item.content}
                            </Text>
                          </Group>
                        </a>
                      ) : (
                        <Group gap="sm">
                          <IconFile size={20} />
                          <Text>{item.name || 'Uploaded File'}</Text>
                        </Group>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}

            {/* Display Feedback if graded */}
            {graded &&
              assignment.submissions[0].grade &&
              assignment.submissions[0].grade.feedback && (
                <Stack gap="xs">
                  <Divider />
                  <Paper withBorder p="md">
                    <Stack gap={4}>
                      <Text fw={500} size="xs" c="dimmed">
                        Feedback
                      </Text>
                      <Text size="sm">
                        {assignment.submissions[0].grade.feedback}
                      </Text>
                    </Stack>
                  </Paper>
                </Stack>
              )}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

function ProgressCard() {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`)

  const { lmsCode, itemId: moduleContentId } = route.useParams()

  const { data: moduleProgress } = useSuspenseQuery(
    lmsControllerGetModuleProgressOverviewOptions({
      path: {
        id: lmsCode,
      },
    }),
  )

  const { data: moduleTree } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: { id: lmsCode },
    }),
  )

  const flattenedContents = useMemo(
    () => flattenModuleTree(moduleTree.moduleSections),
    [moduleTree.moduleSections],
  )

  const currentIndex = flattenedContents.findIndex(
    (item) => item.id === moduleContentId,
  )

  const currentItem = flattenedContents[currentIndex]

  // Get windowed items: 2 before + current + 2 after (max 5 items)
  const getVisibleItems = () => {
    const windowSize = 5
    const beforeCount = 2
    const afterCount = 2

    if (flattenedContents.length === 0) return []
    if (flattenedContents.length <= windowSize) return flattenedContents

    let start = Math.max(0, currentIndex - beforeCount)
    let end = Math.min(flattenedContents.length, currentIndex + afterCount + 1)

    // Adjust if we're near the beginning
    if (currentIndex < beforeCount) {
      end = Math.min(flattenedContents.length, windowSize)
    }

    // Adjust if we're near the end
    if (currentIndex > flattenedContents.length - afterCount - 1) {
      start = Math.max(0, flattenedContents.length - windowSize)
    }

    return flattenedContents.slice(start, end)
  }

  const visibleItems = useMemo(
    () => getVisibleItems(),
    [currentIndex, flattenedContents],
  )

  // Calculate the active index within the visible items
  const activeIndex = useMemo(() => {
    const currentItemIndex = visibleItems.findIndex(
      (item) => item.id === moduleContentId,
    )
    return currentItemIndex
  }, [visibleItems, moduleContentId])

  // Check if a content item is completed
  const isContentCompleted = (item: (typeof flattenedContents)[0]) => {
    return item.studentProgress?.some(
      (progress) => progress.status === 'COMPLETED',
    )
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap={'xs'}>
        <Text fw={600} size="sm">
          Progress
        </Text>
        <Progress
          value={moduleProgress.progressPercentage}
          size="lg"
          radius="md"
          mb={isMobile ? undefined : 'lg'}
        />
        {!isMobile && (
          <Timeline bulletSize={20} lineWidth={2} active={activeIndex}>
            {visibleItems.length > 0 ? (
              visibleItems.map((item, index) => {
                const isCompleted = isContentCompleted(item)
                const isCurrent = item.id === currentItem?.id

                return (
                  <Timeline.Item
                    key={item.id || index}
                    bullet={
                      isCompleted ? (
                        <IconCheck size={12} style={{ color: 'white' }} />
                      ) : (
                        <IconFileText size={12} style={{ color: 'white' }} />
                      )
                    }
                    title={
                      <route.Link
                        from={'/lms/$lmsCode/modules/$itemId'}
                        to={'/lms/$lmsCode/modules/$itemId'}
                        params={{ lmsCode, itemId: item.id }}
                        replace={true}
                        preload="intent"
                        preloadDelay={200}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Text
                          fw={isCurrent ? 600 : isCompleted ? 500 : 400}
                          c={
                            // isCompleted
                            //   ? 'green.8'
                            //   :
                            isCurrent ? 'primary' : 'dimmed'
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          {item.title || 'Untitled Item'}
                        </Text>
                      </route.Link>
                    }
                    color={
                      isCompleted ? 'green.7' : isCurrent ? 'primary' : 'gray'
                    }
                  />
                )
              })
            ) : (
              <Timeline.Item
                bullet={<IconFileText size={12} />}
                title={currentItem?.title || 'Current Item'}
                color="blue"
              />
            )}
          </Timeline>
        )}
      </Stack>
    </Paper>
  )
}

function ContentNavigation() {
  const { lmsCode, itemId: moduleContentId } = route.useParams()

  const { data: moduleTree } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: { id: lmsCode },
    }),
  )

  const flattenedContents = useMemo(
    () => flattenModuleTree(moduleTree.moduleSections),
    [moduleTree.moduleSections],
  )

  const currentIndex = flattenedContents.findIndex(
    (item) => item.id === moduleContentId,
  )

  const previousItem =
    currentIndex > 0 ? flattenedContents[currentIndex - 1] : null
  const nextItem =
    currentIndex < flattenedContents.length - 1
      ? flattenedContents[currentIndex + 1]
      : null

  return (
    <Paper radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          {previousItem && (
            <route.Link
              from={'/lms/$lmsCode/modules/$itemId'}
              to={'/lms/$lmsCode/modules/$itemId'}
              params={{ lmsCode, itemId: previousItem.id }}
              replace={true}
              preload="intent"
              preloadDelay={200}
            >
              <Paper withBorder radius="md" pl="sm" pr="md" py={4}>
                <Group gap="sm">
                  <IconChevronLeft size={14} />
                  <Stack gap={0}>
                    <Text fw={500} c="dimmed" fz={'xs'} truncate maw={'20ch'}>
                      {previousItem.sectionTitle}
                    </Text>
                    <Text fw={500} fz={'sm'} truncate maw={'20ch'}>
                      {previousItem.title}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </route.Link>
          )}
          {nextItem && (
            <route.Link
              from={'/lms/$lmsCode/modules/$itemId'}
              to={'/lms/$lmsCode/modules/$itemId'}
              params={{ lmsCode, itemId: nextItem.id }}
              className="ml-auto"
              replace={true}
              preload="intent"
              preloadDelay={200}
            >
              <Paper withBorder radius="md" pl="md" pr="sm" py={4}>
                <Group gap="sm">
                  <Stack gap={0}>
                    <Text fw={500} c="dimmed" fz={'xs'} truncate maw={'20ch'}>
                      {nextItem.sectionTitle}
                    </Text>
                    <Text fw={500} fz={'sm'} truncate maw={'20ch'}>
                      {nextItem.title}
                    </Text>
                  </Stack>
                  <IconChevronRight size={14} />
                </Group>
              </Paper>
            </route.Link>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}

/**
 * Flattens the module tree structure into a single array of module contents
 * ordered by their hierarchy (section > subsection > content order)
 */
function flattenModuleTree(
  moduleSections: ModuleTreeSectionDto[] | undefined | null,
) {
  if (!moduleSections) return []

  const flatArray: Array<{
    id: string
    title: string
    contentType: string
    order: number
    sectionTitle: string
    subsectionTitle: string
    studentProgress?: Array<{
      id: string
      status: string
      completedAt: string | null
    }>
  }> = []

  moduleSections.forEach((section) => {
    section.subsections?.forEach((subsection) => {
      subsection.moduleContents?.forEach((content) => {
        flatArray.push({
          id: content.id,
          title: content.title,
          contentType: content.contentType,
          order: content.order,
          sectionTitle: section.title,
          subsectionTitle: subsection.title,
          studentProgress: content.studentProgress,
        })
      })
    })
  })

  return flatArray
}
