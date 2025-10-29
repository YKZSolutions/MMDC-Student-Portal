import {
  lmsContentControllerCreateContentProgressMutation,
  lmsContentControllerFindOneOptions,
  lmsContentControllerFindOneQueryKey,
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindModuleTreeQueryKey,
  lmsControllerGetModuleProgressOverviewOptions,
  lmsControllerGetModuleProgressOverviewQueryKey,
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
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useCanGoBack, useRouter } from '@tanstack/react-router'
import { sentenceCase } from 'text-case'
import { Suspense, useMemo, useState } from 'react'
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
          <Grid.Col span={showProgress ? 'auto' : 12}>
            <Stack flex={1}>
              <Suspense fallback={<ModuleViewHeaderSkeleton />}>
                <HeaderSection />
              </Suspense>
              <Suspense fallback={<ModuleViewContentSkeleton />}>
                <ContentArea />
              </Suspense>
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
                            isCompleted
                              ? 'green.8'
                              : isCurrent
                                ? 'primary'
                                : 'dimmed'
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
