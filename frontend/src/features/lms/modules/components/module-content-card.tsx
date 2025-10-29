import type { ModuleTreeContentItem } from '@/features/courses/modules/types'
import type { Role } from '@/integrations/api/client'
import { getContentTypeIcon } from '@/utils/helpers'
import {
  ActionIcon,
  Badge,
  Menu,
  rem,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { Box, Card, Group, ThemeIcon } from '@mantine/core'
import {
  IconCalendarTime,
  IconDotsVertical,
  IconEdit,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'

const roleConfig = {
  student: {
    showDraft: false,
    rightActions: null,
  },
  mentor: {
    showDraft: false,
    rightActions: null,
  },
  admin: {
    showDraft: true,
    rightActions: (props: AdminContentActionsProps) => (
      <AdminContentActions {...props} />
    ),
  },
} satisfies Record<
  Role,
  {
    showDraft: boolean
    rightActions: ((item: AdminContentActionsProps) => React.ReactNode) | null
  }
>

interface ModuleItemCardProps {
  moduleContent: ModuleTreeContentItem
  viewMode: Role
  adminActionProps: Omit<AdminContentActionsProps, 'id' | 'publishedAt'>
  onClick?: () => void
}

export default function ModuleContentCard({
  moduleContent,
  viewMode,
  adminActionProps,
  onClick,
}: ModuleItemCardProps) {
  const { showDraft, rightActions } = roleConfig[viewMode]

  const isOverdue =
    viewMode === 'student' &&
    moduleContent.contentType === 'ASSIGNMENT' &&
    moduleContent.assignment.dueDate &&
    new Date(moduleContent.assignment.dueDate) < new Date()

  const isCompleted =
    viewMode === 'student' &&
    moduleContent.contentType === 'LESSON' &&
    moduleContent.studentProgress &&
    moduleContent.studentProgress.length > 0 &&
    moduleContent.studentProgress.every((p) => p.status === 'COMPLETED')

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
    >
      <Group align="center" justify="space-between" wrap="nowrap">
        {/* Icon + Title */}
        <Group align="center" gap="sm" wrap="nowrap" flex={1}>
          <ThemeIcon
            size="md"
            variant="light"
            color={isOverdue ? 'red' : isCompleted ? 'green.8' : 'gray'}
          >
            {getContentTypeIcon(moduleContent.contentType)}
          </ThemeIcon>

          <Box flex={1}>
            <Group gap="xs" mb={4}>
              <Text fw={500} size="sm" lineClamp={2}>
                {moduleContent.title}
              </Text>

              {moduleContent.contentType && (
                <Badge size="xs" variant="light" color="gray">
                  {moduleContent.contentType}
                </Badge>
              )}

              {!moduleContent.publishedAt && showDraft && (
                <Badge size="xs" variant="outline" color="orange">
                  Draft
                </Badge>
              )}

              {isOverdue && (
                <Badge size="xs" variant="filled" color="red">
                  Overdue
                </Badge>
              )}
            </Group>

            {/* Meta info */}
            {moduleContent.contentType === 'LESSON' && (
              <Text size="xs" c="dimmed">
                {`Reading Material ${isCompleted ? ' • Completed' : ''}`}
              </Text>
            )}

            {moduleContent.contentType === 'ASSIGNMENT' && (
              <Text size="xs" c={isOverdue ? 'red' : 'dimmed'}>
                {moduleContent.assignment.dueDate &&
                  `Due ${dayjs(moduleContent.assignment.dueDate).format('MMM D [by] h:mm A')}`}
              </Text>
            )}
          </Box>
        </Group>

        <Box>
          {rightActions?.({
            id: moduleContent.id,
            publishedAt: moduleContent.publishedAt,
            ...adminActionProps,
          })}
        </Box>
      </Group>
    </Card>
  )
}

interface AdminContentActionsProps {
  id: string
  publishedAt?: string | null
  onPublishNow?: (id: string) => void
  onUnpublish?: (id: string) => void
  onSchedulePublish?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminContentActions({
  id,
  publishedAt,
  onPublishNow,
  onUnpublish,
  onSchedulePublish,
  onEdit,
  onDelete,
}: AdminContentActionsProps) {
  const theme = useMantineTheme()

  return (
    <Group gap={rem(5)}>
      {/* Publish Menu */}
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <Tooltip
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            label={publishedAt ? 'Published' : 'Not Published'}
          >
            <ActionIcon
              component="div"
              variant="subtle"
              color={publishedAt ? 'green' : 'gray'}
              radius="xl"
              size="lg"
            >
              {publishedAt ? (
                <IconRubberStamp size={16} />
              ) : (
                <IconRubberStampOff size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Publish Actions</Menu.Label>

          {!publishedAt && (
            <>
              <Menu.Item
                onClick={(e) => {
                  e.stopPropagation()
                  onPublishNow?.(id)
                }}
                leftSection={
                  <IconRubberStamp
                    size={16}
                    stroke={1.5}
                    color={theme.colors.green[6]}
                  />
                }
              >
                Publish Now
              </Menu.Item>

              <Menu.Item
                onClick={(e) => {
                  e.stopPropagation()
                  onSchedulePublish?.(id)
                }}
                leftSection={
                  <IconCalendarTime
                    size={16}
                    stroke={1.5}
                    color={theme.colors.blue[6]}
                  />
                }
              >
                Schedule Publish
              </Menu.Item>
            </>
          )}

          {publishedAt && (
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                onUnpublish?.(id)
              }}
              leftSection={
                <IconRubberStampOff
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[6]}
                />
              }
            >
              Unpublish
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      {/* Actions Menu */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon
            component="div"
            variant="subtle"
            color="gray"
            radius="xl"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Item Actions</Menu.Label>

          <Menu.Item
            leftSection={<IconEdit size={16} stroke={1.5} />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(id)
            }}
          >
            Edit
          </Menu.Item>

          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} stroke={1.5} />}
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(id)
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
