import AddModuleItemDrawer from '@/features/courses/modules/admin/add-module-item-drawer'
import type { ModuleTreeSectionDto, Role } from '@/integrations/api/client'
import {
  Accordion,
  ActionIcon,
  Badge,
  Divider,
  Group,
  Menu,
  Progress,
  rem,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import {
  IconCalendarTime,
  IconChartBar,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Fragment, useState, type ReactNode } from 'react'

interface ModuleSectionCardProps {
  id: string
  viewMode: Role
  title: string
  publishedAt: string | null
  expandedItems: string[]
  setExpandedItems?: (value: string[]) => void
  adminActionProps: Omit<AdminSectionActionsProps, 'id' | 'publishedAt'>
  children: ReactNode
  progressPercentage?: number
  completedItems?: number
  totalItems?: number
}

export function ModuleSectionCard({
  id,
  title,
  viewMode,
  publishedAt,
  expandedItems,
  setExpandedItems,
  adminActionProps,
  children,
  progressPercentage,
  completedItems,
  totalItems,
}: ModuleSectionCardProps) {
  const theme = useMantineTheme()

  return (
    <Fragment>
      <Accordion.Item value={id}>
        <Accordion.Control py={'sm'}>
          <Group wrap="nowrap" flex={1} align="start">
            <Stack gap={'xs'} flex={1}>
              <Group gap="xs" mb={4}>
                <Title order={4} fw={600}>
                  {title}
                </Title>

                {!publishedAt && viewMode !== 'student' && (
                  <Badge size="xs" variant="outline" color="orange">
                    Draft
                  </Badge>
                )}
              </Group>

              {viewMode !== 'student' && publishedAt && (
                <Text size="xs" c="dimmed">
                  {`Published ${dayjs(publishedAt).format('MMM D [on] h:mm A')}`}
                </Text>
              )}
            </Stack>

            {viewMode === 'student' &&
              progressPercentage !== undefined &&
              totalItems !== undefined &&
              totalItems > 0 && (
                <Stack gap={4} w="100%" maw={300} align="flex-end">
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {completedItems || 0} / {totalItems}
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </Group>
                  <Progress
                    value={progressPercentage}
                    size="md"
                    radius="xl"
                    color="blue"
                    w="100%"
                  />
                </Stack>
              )}

            {viewMode === 'mentor' && (
              <Tooltip label="View section analytics">
                <ActionIcon variant="subtle" color="blue" radius="xl" size="md">
                  <IconChartBar size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {viewMode === 'admin' && (
              <AdminSectionActions
                id={id}
                publishedAt={publishedAt}
                {...adminActionProps}
              />
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          {/* Subsections */}
          <Accordion
            multiple
            value={expandedItems}
            onChange={setExpandedItems}
            chevronPosition="left"
            variant="separated"
            radius={'md'}
            styles={{
              chevron: {
                padding: theme.spacing.sm,
              },
            }}
          >
            {children}
          </Accordion>
        </Accordion.Panel>
      </Accordion.Item>
      <Divider />
    </Fragment>
  )
}

interface ModuleSubsectionCardProps {
  id: string
  viewMode: Role
  title: string
  publishedAt: string | null
  adminActionProps: Omit<AdminSectionActionsProps, 'id' | 'publishedAt'>
  children: ReactNode
}

export function ModuleSubsectionCard({
  id,
  title,
  viewMode,
  publishedAt,
  adminActionProps,
  children,
}: ModuleSubsectionCardProps) {
  return (
    <Accordion.Item value={id} bg={'white'} className="ring-1 ring-gray-200">
      <Accordion.Control py={'sm'}>
        <Group wrap="nowrap" flex={1}>
          <Stack gap={'xs'} flex={1}>
            <Group gap="xs" mb={4}>
              <Title order={5} fw={600}>
                {title}
              </Title>

              {!publishedAt && viewMode !== 'student' && (
                <Badge size="xs" variant="outline" color="orange">
                  Draft
                </Badge>
              )}
            </Group>

            {viewMode !== 'student' && publishedAt && (
              <Text size="xs" c="dimmed">
                {`Published ${dayjs(publishedAt).format('MMM D [on] h:mm A')}`}
              </Text>
            )}
          </Stack>

          {viewMode === 'mentor' && (
            <Tooltip label="View section analytics">
              <ActionIcon variant="subtle" color="blue" radius="xl" size="md">
                <IconChartBar size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {viewMode === 'admin' && (
            <AdminSectionActions
              id={id}
              publishedAt={publishedAt}
              {...adminActionProps}
            />
          )}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="xs">{children}</Stack>
      </Accordion.Panel>
    </Accordion.Item>
  )
}

interface AdminSectionActionsProps {
  id: string
  publishedAt?: string | null
  onPublishNow?: (id: string) => void
  onUnpublish?: (id: string) => void
  onSchedulePublish?: (id: string) => void
  onDelete?: (id: string) => void
  onRename?: (id: string) => void
  onAddItem?: (id: string) => void
}

function AdminSectionActions({
  id,
  publishedAt,
  onPublishNow,
  onUnpublish,
  onSchedulePublish,
  onDelete,
  onRename,
  onAddItem,
}: AdminSectionActionsProps) {
  const theme = useMantineTheme()

  return (
    <Group gap={rem(5)}>
      {/* Publish Menu */}
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <Tooltip
            onClick={(e) => e.stopPropagation()}
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

      {/* Add Item Drawer */}
      {/* <Tooltip label="Add new item">
        <AddModuleItemDrawer props={{ sectionId: id }}>
          {({ setDrawer }) => (
            <ActionIcon
              component="div"
              variant="subtle"
              color="blue"
              radius="xl"
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                setDrawer(true)
                onAddItem?.(id)
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          )}
        </AddModuleItemDrawer>
      </Tooltip> */}
      <ActionIcon
        component="div"
        variant="subtle"
        color="blue"
        radius="xl"
        size="lg"
        onClick={(e) => {
          e.stopPropagation()
          onAddItem?.(id)
        }}
      >
        <IconPlus size={16} />
      </ActionIcon>

      {/* Actions Menu */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon
            component="div"
            variant="subtle"
            color="gray"
            radius="xl"
            size="lg"
            onClick={(e) => e.stopPropagation()}
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
              onRename?.(id)
            }}
          >
            Rename
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
