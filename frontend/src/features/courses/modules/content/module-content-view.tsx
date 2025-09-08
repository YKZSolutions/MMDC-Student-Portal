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
  FileInput,
  Flex,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
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
  IconLink,
  IconUpload,
} from '@tabler/icons-react'
import { BlockNoteView } from '@blocknote/mantine'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

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
  const allItems = getFlatItems(module.sections)
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
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [comments, setComments] = useState('')

  const submitted =
    assignmentItem.assignment && 'submissionStatus' in assignmentItem.assignment
      ? assignmentItem.assignment?.submissionStatus === 'submitted'
      : false

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
            {/* File Upload */}
            <FileInput
              placeholder="Attach a file"
              leftSection={<IconUpload size={16} />}
              value={file}
              onChange={setFile}
            />

            {/* Link Submission */}
            <TextInput
              placeholder="https://example.com/your-work"
              label="Submit a link"
              leftSection={<IconLink size={16} />}
              value={link}
              onChange={(e) => setLink(e.currentTarget.value)}
            />

            {/* Comments */}
            <Textarea
              placeholder="Add a description or comments (optional)"
              label="Comments"
              minRows={3}
              value={comments}
              onChange={(e) => setComments(e.currentTarget.value)}
            />

            {/* Actions */}
            <Group justify="flex-end">
              <Button variant="light">Quick Submit</Button>
              <Link
                from={'/courses/$courseCode/modules'}
                to={`$itemId/submit`}
                params={{ itemId: assignmentItem.id }}
              >
                <Button rightSection={<IconExternalLink size={16} />}>
                  Go to Submission Page
                </Button>
              </Link>
            </Group>
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

function getFlatItems(sections: ModuleSection[]): ModuleItem[] {
  let items: ModuleItem[] = []
  sections.forEach((s) => {
    items = [...items, ...s.items, ...getFlatItems(s.subsections || [])]
  })
  return items.sort((a, b) => a.order - b.order)
}

export default ModuleContentView
