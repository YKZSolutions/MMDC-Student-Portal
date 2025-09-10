import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  SubmissionForm,
  type SubmissionPayload,
} from '@/features/courses/modules/content/submission-form.tsx'
import type {
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { getModuleItemsFromSections } from '@/utils/helpers.ts'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconExternalLink,
  IconFileText,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

interface ModuleContentViewProps {
  moduleItem: ModuleItem
  parentSection: ModuleSection
  module: Module
  isPreview?: boolean
}

function ModuleContentView({
  moduleItem,
  parentSection,
  module,
  isPreview = false,
}: ModuleContentViewProps) {
  // Flattened list of all module items
  const allItems = getModuleItemsFromSections(module.sections)
  const currentIndex = allItems.findIndex((i) => i.id === moduleItem.id)
  const previousItem = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const nextItem =
    currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null

  // Progress
  const completed = allItems.filter((i) => i.progress?.isCompleted).length
  const progressPercentage = allItems.length
    ? (completed / allItems.length) * 100
    : 0

  // Editor setup
  const initialContent = moduleItem.content ? moduleItem.content : undefined
  const editor = useCreateBlockNote({ initialContent })

  return (
    <Container size="lg" py="xl" pt={"lg"}>
      {/* Main Content Area */}
      <Stack flex={1}>
        <Button
          variant="default"
          radius={'md'}
          component={Link}
          to="../"
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
                moduleItem={moduleItem}
                parentSection={parentSection}
                module={module}
                onMarkComplete={() => {}}
                onPublish={() => {}}
              />
              <ContentArea moduleItem={moduleItem} editor={editor} />

              {moduleItem.type === 'assignment' && moduleItem.assignment && (
                <EmbeddedSubmissionBox assignmentItem={moduleItem} />
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
            <ProgressCard
              allItems={allItems}
              moduleItem={moduleItem}
              progressPercentage={progressPercentage}
            />
          </Grid.Col>
        </Grid>

        {/* Continue Button */}
        <Navigation previousItem={previousItem} nextItem={nextItem} />
      </Stack>
    </Container>
  )
}

/* ---------------------------------------------------
   Subcomponents
--------------------------------------------------- */

type ModuleItemProps = {
  moduleItem: ModuleItem
  parentSection: ModuleSection
  module: Module
  onMarkComplete: () => void
  onPublish: () => void
}
function HeaderSection({
  moduleItem,
  parentSection,
  module,
  onMarkComplete,
  onPublish,
}: ModuleItemProps) {
  const { authUser } = useAuth('protected')

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="md">
        <Group align="start" gap="sm" justify="space-between">
          <Box>
            <Title order={1} size="h2" mb="xs">
              {moduleItem.title}
            </Title>
            <Group gap="xs">
              <Badge variant="light">{module.courseCode}</Badge>
              {authUser.role !== 'student' && (
                <Badge
                  variant="light"
                  color={moduleItem.published.isPublished ? 'green' : 'red'}
                >
                  {moduleItem.published.isPublished ? 'Published' : 'Draft'}
                </Badge>
              )}
            </Group>
          </Box>

          <Group>
            <Button
              variant={moduleItem.progress?.isCompleted ? 'filled' : 'outline'}
              color={moduleItem.progress?.isCompleted ? 'green' : 'blue'}
              leftSection={
                moduleItem.progress?.isCompleted ? (
                  <IconCheck size={16} />
                ) : (
                  <IconBookmark size={16} />
                )
              }
              onClick={onMarkComplete}
            >
              {authUser.role !== 'student'
                ? moduleItem.published.isPublished
                  ? 'Published'
                  : 'Publish'
                : moduleItem.progress?.isCompleted
                  ? 'Completed'
                  : 'Mark Complete'}
            </Button>
            {moduleItem.type === 'assignment' && (
              <Button color="blue" leftSection={<IconEdit size={16} />}>
                Submit
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
}

// 🔹 Content Section
type ContentAreaProps = {
  moduleItem: ModuleItem
  editor: any
}
function ContentArea({ moduleItem, editor }: ContentAreaProps) {
  return (
    <Paper withBorder radius="md" p="xl">
      {moduleItem.content ? (
        <BlockNoteView editor={editor} theme="light" editable={false} />
      ) : (
        <Text c="dimmed" fs="italic">
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
  previousItem: ModuleItem | null
  nextItem: ModuleItem | null
}) {
  return (
    <Paper radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          {previousItem && (
            <Link
              from={'/courses/$courseCode/modules'}
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
              from={'/courses/$courseCode/modules'}
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
  moduleItem,
  progressPercentage,
}: {
  allItems: ModuleItem[]
  moduleItem: ModuleItem
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
            {allItems.slice(0, 5).map((item) => (
              <Timeline.Item
                key={item.id}
                bullet={
                  item.progress?.isCompleted ? (
                    <IconCheck size={12} />
                  ) : (
                    <IconFileText size={12} />
                  )
                }
                title={item.title}
                color={
                  item.progress?.isCompleted
                    ? 'green'
                    : item.id === moduleItem.id
                      ? 'blue'
                      : 'gray'
                }
              />
            ))}
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

function EmbeddedSubmissionBox({
  assignmentItem,
}: {
  assignmentItem: ModuleItem
}) {
  const submitted =
    assignmentItem.assignment && 'submissionStatus' in assignmentItem.assignment
      ? assignmentItem.assignment?.submissionStatus === 'submitted'
      : false

  const handleQuickSubmit = (payload: SubmissionPayload) => {
    console.log('Quick submitting...', {
      ...payload,
      assignmentId: assignmentItem.assignment?.id,
    })
    // TODO: mutation call
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack>
        {/* Header */}
        <Group justify="space-between">
          <Text fw={500}>Submission</Text>
          {submitted ? (
            <Badge color="green">Submitted</Badge>
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
            />
          </>
        ) : (
          // Submitted State
          <Group justify="flex-end">
            <Link
              from={'/courses/$courseCode/modules'}
              to={`$itemId/submit`}
              params={{ itemId: assignmentItem.id }}
            >
              <Button
                variant="light"
                rightSection={<IconExternalLink size={16} />}
              >
                View Submission
              </Button>
            </Link>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default ModuleContentView
