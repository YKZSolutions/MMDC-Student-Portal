import type {
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { useCreateBlockNote } from '@blocknote/react'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
  Title,
} from '@mantine/core'
import {
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFileText,
} from '@tabler/icons-react'
import { BlockNoteView } from '@blocknote/mantine'
import { Link } from '@tanstack/react-router'
import {
  SubmissionForm,
  type SubmissionPayload,
} from '@/features/courses/modules/content/submission-form.tsx'
import { getModuleItemsFromSections } from '@/utils/helpers.ts'

interface ModuleContentViewProps {
  moduleItem: ModuleItem
  parentSection: ModuleSection
  module: Module
  isPreview?: boolean
}

const ModuleContentView = ({
  moduleItem,
  parentSection,
  module,
  isPreview = false,
}: ModuleContentViewProps) => {
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
    <Container size="lg" py="md">
      {/* Top Progress Indicator */}
      <Progress value={progressPercentage} size="sm" radius="xl" mb="lg" />

      <Flex gap="xl" align="flex-start">
        {/* Main Content Area */}
        <Box flex={1}>
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

          {/* Continue Button */}
          {nextItem && !isPreview && (
            <Link
              from={'/courses/$courseCode/modules'}
              to={`$itemId`}
              params={{ itemId: nextItem.id }}
            >
              <Button
                mt="xl"
                fullWidth
                size="md"
                rightSection={<IconChevronRight size={18} />}
              >
                Continue to {nextItem.title}
              </Button>
            </Link>
          )}
        </Box>

        {/* Sidebar */}
        <div hidden={isPreview}>
          <Sidebar
            previousItem={previousItem}
            nextItem={nextItem}
            allItems={allItems}
            moduleItem={moduleItem}
            progressPercentage={progressPercentage}
            completed={completed}
            total={allItems.length}
          />
        </div>
      </Flex>
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
const HeaderSection = ({
  moduleItem,
  parentSection,
  module,
  onMarkComplete,
  onPublish,
}: ModuleItemProps) => {
  const { authUser } = useAuth('protected')
  const breadcrumbItems = [
    { title: `${module.courseCode}: ${module.courseName}`, href: '#' },
    { title: parentSection.title, href: '#' },
    { title: moduleItem.title, href: '#' },
  ].map((item, idx) => (
    <Anchor href={item.href} key={idx} size="sm">
      {item.title}
    </Anchor>
  ))

  return (
    <Paper shadow="sm" radius="md" p="xl" mb="xl">
      <Stack gap="md">
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Box flex={1}>
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

          <Group gap="sm">
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
              <Button leftSection={<IconEdit size={16} />}>Submit</Button>
            )}
            <ActionIcon variant="light" size="lg">
              <IconDownload size={16} />
            </ActionIcon>
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
const ContentArea = ({ moduleItem, editor }: ContentAreaProps) => {
  return (
    <Paper shadow="sm" radius="md" p="xl">
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

type SidebarProps = {
  previousItem: ModuleItem | null
  nextItem: ModuleItem | null
  allItems: ModuleItem[]
  moduleItem: ModuleItem
  progressPercentage: number
  completed: number
  total: number
}

const Sidebar = ({
  previousItem,
  nextItem,
  allItems,
  moduleItem,
  progressPercentage,
  completed,
  total,
}: SidebarProps) => {
  return (
    <Box w={280} style={{ position: 'sticky', top: 20 }}>
      {/* Navigation */}
      <Paper shadow="sm" radius="md" p="lg" mb="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Link
              from={'/courses/$courseCode/modules'}
              to={`$itemId`}
              params={{ itemId: previousItem?.id || '' }}
            >
              <Button
                variant="light"
                size="sm"
                leftSection={<IconChevronLeft size={14} />}
                disabled={!previousItem}
              >
                Previous
              </Button>
            </Link>
            <Link
              from={'/courses/$courseCode/modules'}
              to={`$itemId`}
              params={{ itemId: nextItem?.id || '' }}
            >
              <Button
                variant="light"
                size="sm"
                rightSection={<IconChevronRight size={14} />}
                disabled={!nextItem}
              >
                Next
              </Button>
            </Link>
          </Group>
          {nextItem && (
            <Card withBorder radius="md" p="sm">
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                Up Next
              </Text>
              <Text size="sm" fw={500}>
                {nextItem.title}
              </Text>
            </Card>
          )}
        </Stack>
      </Paper>

      {/* Progress */}
      <Paper shadow="sm" radius="md" p="lg">
        <Text fw={600} size="sm" mb="sm">
          Progress
        </Text>
        <Progress value={progressPercentage} size="lg" radius="md" mb="md" />
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
      </Paper>
    </Box>
  )
}

const EmbeddedSubmissionBox = ({
  assignmentItem,
}: {
  assignmentItem: ModuleItem
}) => {
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
    <Card shadow="sm" radius="md" mt="lg" p="md">
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
