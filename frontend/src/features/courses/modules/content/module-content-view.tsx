import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  SubmissionForm,
  type SubmissionPayload,
} from '@/features/courses/modules/content/submission-form.tsx'
import { useQuickForm } from '@/hooks/use-quick-form'
import type { ModuleContent } from '@/integrations/api/client'
import {
  getContentKeyAndData,
  isEditorEmpty,
  toBlockArray,
  type ExistingContent,
} from '@/utils/helpers.tsx'
import type { Block, BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  InputBase,
  NumberInput,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconExternalLink,
  IconFileText,
  IconLink,
} from '@tabler/icons-react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import {
  assignmentConfigFormSchema,
  type AssignmentConfigFormInput,
  type AssignmentConfigFormOutput,
} from './assignment-config.schema'
import {
  lmsAssignmentControllerFindOneForStudentOptions,
  lmsAssignmentControllerFindOneForStudentQueryKey,
  lmsAssignmentControllerFindOneOptions,
  lmsAssignmentControllerFindOneQueryKey,
  lmsAssignmentControllerSubmitMutation,
  lmsAssignmentControllerUpdateMutation,
  lmsContentControllerFindOneOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { useSuspenseQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { useForm } from '@mantine/form'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { toastMessage } from '@/utils/toast-message'
import { getContext } from '@/integrations/tanstack-query/root-provider'

const route = getRouteApi('/(protected)/lms/$lmsCode/modules/$itemId/edit')

interface ModuleContentViewProps {
  moduleContentData: ModuleContent | null
  editor: BlockNoteEditor
  isPreview?: boolean
}

function ModuleContentView({
  moduleContentData,
  editor,
  isPreview = false,
}: ModuleContentViewProps) {
  const { authUser: user } = useAuth('protected')

  // Extract content data from moduleContentData
  const { existingContent, contentKey } = getContentKeyAndData(
    moduleContentData || ({} as ModuleContent),
  )

  // For now, we'll disable some features that depend on full module structure
  // until we have proper integration with the module context
  const allItems: any[] = [] // TODO: Implement when module context is available
  const progressPercentage = 0 // TODO: Implement when progress tracking is available
  const previousItem = null // TODO: Implement navigation when module context is available
  const nextItem = null // TODO: Implement navigation when module context is available

  return (
    <Container size="lg" w={'100%'} py="xl" pt={'lg'}>
      {/* Main Content Area */}
      <Stack flex={1}>
        <Button
          variant="default"
          radius={'md'}
          component={Link}
          to="/lms/$lmsCode/modules"
          maw={'fit-content'}
        >
          <Group>
            <IconChevronLeft size={16} />
            <span>Back to Modules</span>
          </Group>
        </Button>

        {/* Header Section */}
        <Grid>
          <Grid.Col
            span={{
              base: 12,
              lg: 8,
            }}
            order={{
              base: 2,
              lg: 1,
            }}
          >
            <Stack flex={1}>
              <HeaderSection
                moduleContentData={moduleContentData}
                existingContent={existingContent}
                onMarkComplete={() => {}}
                onPublish={() => {}}
              />

              <ContentArea
                content={toBlockArray(existingContent?.content)}
                editor={editor}
                isPreview={isPreview}
              />

              {moduleContentData?.contentType === 'ASSIGNMENT' &&
                user.role === 'student' && (
                  <EmbeddedSubmissionBox assignmentData={existingContent} />
                )}
            </Stack>
          </Grid.Col>

          <Grid.Col
            span={{
              base: 12,
              lg: 4,
            }}
            order={{
              base: 1,
              lg: 2,
            }}
          >
            {user.role === 'student' && (
              <ProgressCard
                allItems={allItems}
                existingContent={existingContent}
                progressPercentage={progressPercentage}
              />
            )}

            {user.role === 'admin' && contentKey === 'assignment' && (
              <AssignmentConfigCard />
            )}
          </Grid.Col>
        </Grid>

        <Divider my={'lg'} mb={'md'} />

        {/* Navigation - disabled until module context is available */}
        <Navigation previousItem={previousItem} nextItem={nextItem} />
      </Stack>
    </Container>
  )
}

/* ---------------------------------------------------
   Subcomponents
--------------------------------------------------- */

function AssignmentConfigCard() {
  const { itemId } = route.useParams()
  const { id } = route.useSearch()
  const { data: moduleContent } = useSuspenseQuery(
    lmsContentControllerFindOneOptions({
      path: { moduleContentId: itemId },
    }),
  )

  const { update, form, isPending } = useQuickForm<
    AssignmentConfigFormInput,
    AssignmentConfigFormOutput
  >()({
    name: 'config',
    formOptions: {
      initialValues: {
        maxScore: null,
        dueAt: null,
        maxAttempt: null,
      },
      validate: zod4Resolver(assignmentConfigFormSchema),
    },
    transformQueryData: (config) => ({
      maxScore: config.grading?.weight
        ? new Decimal(config.grading.weight).toNumber()
        : null,
      dueAt: config.dueDate
        ? dayjs(config.dueDate).utc().format('YYYY-MM-DDTHH:mm:ss')
        : null,
      maxAttempt: config.maxAttempts,
    }),
    queryOptions: lmsAssignmentControllerFindOneOptions({
      path: { moduleContentId: itemId },
    }),
    createMutationOptions: lmsAssignmentControllerUpdateMutation({}),
    updateMutationOptions: lmsAssignmentControllerUpdateMutation({}),
    queryKeyInvalidation: lmsAssignmentControllerFindOneQueryKey({
      path: { moduleContentId: itemId },
    }),
  })

  const handleSaveConfig = async (values: AssignmentConfigFormOutput) => {
    console.log(values)
    if (form.validate().hasErrors) return
    const { maxScore, dueAt, maxAttempt } = values

    update.mutateAsync({
      path: { assignmentId: moduleContent.assignment?.id || '' },
      body: {
        maxScore: maxScore ? new Decimal(maxScore).toString() : undefined,
        dueAt:
          dayjs(dueAt, 'YYYY-MM-DD HH:mm:ss').format(
            'YYYY-MM-DDTHH:mm:ss[Z]',
          ) || undefined,
        maxAttempt: maxAttempt || undefined,
      },
    })
  }

  return (
    <Card withBorder>
      <Stack>
        <Text fw={500}>Assignment Config</Text>
        <NumberInput
          variant="filled"
          label="Points"
          placeholder="100"
          allowDecimal
          disabled={isPending}
          key={form.key('maxScore')}
          {...form.getInputProps('maxScore')}
        />
        <DateTimePicker
          variant="filled"
          label="Due"
          placeholder="Select date and time"
          disabled={isPending}
          key={form.key('dueAt')}
          {...form.getInputProps('dueAt')}
        />
        <NumberInput
          variant="filled"
          label="Attempts"
          placeholder="1"
          min={1}
          disabled={isPending}
          key={form.key('maxAttempt')}
          {...form.getInputProps('maxAttempt')}
        />
        <Button
          loading={isPending}
          onClick={() => handleSaveConfig(form.getValues())}
        >
          Save
        </Button>
      </Stack>
    </Card>
  )
}

type HeaderSectionProps = {
  moduleContentData: ModuleContent | null
  existingContent: ExistingContent<ModuleContent> | undefined
  onMarkComplete: () => void
  onPublish: () => void
}

function HeaderSection({
  moduleContentData,
  existingContent,
  onMarkComplete,
  onPublish,
}: HeaderSectionProps) {
  const { authUser } = useAuth('protected')

  if (!existingContent) {
    return (
      <Paper withBorder radius="md" p="xl">
        <Text c="dimmed">No content data available.</Text>
      </Paper>
    )
  }

  const isPublished = !!moduleContentData?.publishedAt

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="md">
        <Group align="start" gap="sm" justify="space-between">
          <Box>
            <Title order={1} size="h2" mb="xs">
              {existingContent.title}
            </Title>
            <Group gap="xs">
              {/* <Badge variant="light">{module?.courseCode || 'N/A'}</Badge> */}
              {authUser.role !== 'student' && (
                <Badge variant="light" color={isPublished ? 'green' : 'red'}>
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              )}
            </Group>
          </Box>

          <Group>
            <Button
              variant={isPublished ? 'filled' : 'outline'}
              color={isPublished ? 'green' : 'blue'}
              leftSection={
                isPublished ? (
                  <IconCheck size={16} />
                ) : (
                  <IconBookmark size={16} />
                )
              }
              onClick={onPublish}
            >
              {authUser.role !== 'student'
                ? isPublished
                  ? 'Published'
                  : 'Publish'
                : isPublished
                  ? 'Completed'
                  : 'Mark Complete'}
            </Button>
            {/* {moduleContentData?.contentType === 'ASSIGNMENT' && (
              <Button color="blue" leftSection={<IconEdit size={16} />}>
                Submit
              </Button>
            )} */}
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
}

// Content Section
type ContentAreaProps = {
  content: Block[]
  editor: BlockNoteEditor
  isPreview: boolean
}

function ContentArea({ content, editor, isPreview }: ContentAreaProps) {
  const editorData = isPreview
    ? editor
    : useCreateBlockNote({
        initialContent: toBlockArray(content),
      })

  return (
    <Paper withBorder radius="md" py="xl">
      {!isEditorEmpty(editorData) ? (
        <BlockNoteView editor={editorData} theme="light" editable={false} />
      ) : (
        <Text c="dimmed" fs="italic" px={'xl'}>
          No content available for this item.
        </Text>
      )}
    </Paper>
  )
}

function Navigation({
  previousItem,
  nextItem,
}: {
  previousItem: any | null
  nextItem: any | null
}) {
  // Navigation is disabled when items are null (no module context available)
  if (!previousItem && !nextItem) {
    return null
  }

  return (
    <Paper radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          {previousItem && (
            <Link
              from={'/lms/$lmsCode/modules'}
              to={`$itemId`}
              params={{ itemId: previousItem?.id || '' }}
            >
              <Button
                variant="default"
                radius={'md'}
                size="sm"
                leftSection={<IconChevronLeft size={14} />}
              >
                <Text fw={500} fz={'sm'} truncate maw={'20ch'}>
                  {previousItem.title}
                </Text>
              </Button>
            </Link>
          )}
          {nextItem && (
            <Link
              from={'/lms/$lmsCode/modules'}
              to={`$itemId`}
              params={{ itemId: nextItem?.id || '' }}
              className="ml-auto"
            >
              <Button
                variant="default"
                radius={'md'}
                size="sm"
                rightSection={<IconChevronRight size={14} />}
              >
                <Text fw={500} fz={'sm'} truncate maw={'20ch'}>
                  {nextItem.title}
                </Text>
              </Button>
            </Link>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}

function ProgressCard({
  allItems,
  existingContent,
  progressPercentage,
}: {
  allItems: any[]
  existingContent: ExistingContent<ModuleContent> | undefined
  progressPercentage: number
}) {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`)

  return (
    <Paper
      withBorder
      radius="md"
      p={{
        base: 'md',
        lg: 'xl',
      }}
    >
      <Stack gap={'xs'}>
        <Text fw={600} size="sm">
          Progress
        </Text>
        <Progress
          value={progressPercentage}
          size="lg"
          radius="md"
          mb={isMobile ? undefined : 'lg'}
        />
        {!isMobile && (
          <Timeline bulletSize={20} lineWidth={2}>
            {allItems.length > 0 ? (
              allItems
                .slice(0, 5)
                .map((item, index) => (
                  <Timeline.Item
                    key={item.id || index}
                    bullet={<IconFileText size={12} />}
                    title={item.title || 'Untitled Item'}
                    color={item.id === existingContent?.id ? 'blue' : 'gray'}
                  />
                ))
            ) : (
              <Timeline.Item
                bullet={<IconFileText size={12} />}
                title={existingContent?.title || 'Current Item'}
                color="blue"
              />
            )}
            {allItems.length > 5 && (
              <Timeline.Item
                title={`+${allItems.length - 5} more`}
                color="gray"
              />
            )}
          </Timeline>
        )}
      </Stack>
    </Paper>
  )
}

const routeView = getRouteApi('/(protected)/lms/$lmsCode/modules/$itemId/')

interface SubmissionContent {
  type: 'link' | 'comment'
  content?: string
}

function EmbeddedSubmissionBox({ assignmentData }: { assignmentData: any }) {
  // For now, we'll assume not submitted since we don't have submission status from editorState
  const { itemId } = routeView.useParams()

  const { data: assignment } = useSuspenseQuery(
    lmsAssignmentControllerFindOneForStudentOptions({
      path: { moduleContentId: itemId },
    }),
  )

  const submitted = assignment.submissions.length > 0
  const graded = submitted && assignment.submissions[0].state === 'GRADED'

  const submissionContent = assignment.submissions[0]
    ? (assignment.submissions[0].content as unknown as SubmissionContent[])
    : undefined

  const attachments = assignment.submissions[0]
    ? assignment.submissions[0].attachments
    : undefined

  const link = submissionContent?.find(
    (submission) => submission.type === 'link',
  )
  const comment = submissionContent?.find(
    (submission) => submission.type === 'comment',
  )

  const { mutateAsync: quickSubmit, isPending } = useAppMutation(
    lmsAssignmentControllerSubmitMutation,
    toastMessage('file', 'submitting', 'submitted'),
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: lmsAssignmentControllerFindOneForStudentQueryKey({
            path: { moduleContentId: itemId },
          }),
        })
      },
    },
  )

  const handleQuickSubmit = (payload: SubmissionPayload) => {
    const content: SubmissionContent[] = []

    if (payload.link) {
      content.push({ type: 'link', content: payload.link })
    }

    if (payload.comments) {
      content.push({ type: 'comment', content: payload.comments })
    }

    quickSubmit({
      path: { assignmentId: assignment.id },
      body: {
        state: 'SUBMITTED',
        content: content as any,
      },
    })
    // TODO: mutation call
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack>
        {/* Header */}
        <Group justify="space-between">
          <Text fw={500}>Submission</Text>
          {graded ? (
            <Badge color=" green">Graded</Badge>
          ) : submitted ? (
            <Badge color="primary">Submitted</Badge>
          ) : (
            <Badge color="red" variant="light">
              Not Submitted
            </Badge>
          )}
        </Group>

        {/* Not Submitted State */}
        {!submitted ? (
          <>
            <SubmissionForm
              onSubmit={handleQuickSubmit}
              buttonLabel="Quick Submit"
              withSubmissionPageNavigation={true}
              loading={isPending}
            />
          </>
        ) : (
          // Submitted State
          // <Group justify="flex-end">
          //   <Link
          //     from={'/lms/$lmsCode/modules'}
          //     to={`$itemId/submit`}
          //     params={{ itemId: assignmentData?.id || '' }}
          //   >
          //     <Button
          //       variant="light"
          //       rightSection={<IconExternalLink size={16} />}
          //     >
          //       View Submission
          //     </Button>
          //   </Link>
          // </Group>
          <Stack>
            <a href={link?.content} target="_blank">
              <InputBase
                component="button"
                pointer
                label="Link"
                leftSection={<IconLink size={20} />}
              >
                <Text c="dark.3">{link?.content}</Text>
              </InputBase>
            </a>

            {attachments && attachments.length > 0 && (
              <Card>
                <Group>
                  <Text>{attachments[0].name}</Text>
                </Group>
              </Card>
            )}

            {comment && (
              <Stack gap={0}>
                <Text fw={500} size="sm">
                  Comments
                </Text>
                <Text>{comment?.content}</Text>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

export default ModuleContentView
