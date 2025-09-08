import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Card,
  Flex,
  Group,
  type GroupProps,
  Indicator,
  Menu,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import {
  getCompletedItemsCount,
  getOverdueItemsCount,
  getSubmissionStatus,
} from '@/utils/helpers.ts'
import type {
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CompletedStatusIcon } from '@/components/icon-selector.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SubmitButton from '@/components/submit-button.tsx'
import {
  IconAlertCircle,
  IconCalendarTime,
  IconChartBar,
  IconClipboard,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFile,
  IconFileText,
  IconMessageCircle,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useDisclosure } from '@mantine/hooks'

interface ModulePanelProps {
  module: Module
  viewMode: 'student' | 'mentor' | 'admin'
  allExpanded?: boolean
}

const ModulePanel = ({
  module,
  viewMode,
  allExpanded = false,
}: ModulePanelProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const theme = useMantineTheme()

  // Update expanded state when allExpanded prop changes
  useEffect(() => {
    if (allExpanded) {
      const allSectionIds = module.sections.map((section) => section.id)
      const allSubSectionIds = module.sections.flatMap((section) =>
        section.subsections?.map((section) => section.id),
      )
      setExpandedItems([...allSectionIds, ...(allSubSectionIds as string[])])
    } else {
      setExpandedItems([])
    }
  }, [allExpanded])

  return (
    <Box p="md">
      {/* Sections Accordion */}
      <Accordion
        multiple
        value={expandedItems}
        onChange={setExpandedItems}
        chevronPosition="left"
        variant="separated"
        radius="md"
        styles={{
          item: {
            border: `1px solid ${theme.colors.gray[3]}`,
            '&[data-active]': {
              borderColor: theme.colors.blue[4],
            },
          },
        }}
      >
        {module.sections.map((section) => {
          const sectionItems =
            section.subsections?.flatMap((sub) => sub.items) || []
          const sectionCompleted = getCompletedItemsCount(sectionItems)
          const sectionOverdue = getOverdueItemsCount(sectionItems)
          const sectionProgress =
            sectionItems.length > 0
              ? (sectionCompleted / sectionItems.length) * 100
              : 0

          return (
            <Accordion.Item
              value={section.id}
              key={section.title}
              bg={'background'}
            >
              <CustomAccordionControl
                item={section}
                title={section.title}
                completedItemsCount={sectionCompleted}
                totalItemsCount={sectionItems.length}
                overdueItemsCount={sectionOverdue}
                progressPercentage={sectionProgress}
                viewMode={viewMode}
              />
              <Accordion.Panel>
                {/* Subsections */}
                <Accordion
                  multiple
                  value={expandedItems}
                  onChange={setExpandedItems}
                  chevronPosition="left"
                  variant="separated"
                  radius="md"
                  styles={{
                    item: {
                      border: `1px solid ${theme.colors.gray[2]}`,
                      marginBottom: theme.spacing.sm,
                    },
                  }}
                >
                  {section.subsections?.map((subsection) => {
                    const subsectionCompleted = getCompletedItemsCount(
                      subsection.items,
                    )
                    const subsectionOverdue = getOverdueItemsCount(
                      subsection.items,
                    )
                    const subsectionProgress =
                      subsection.items.length > 0
                        ? (subsectionCompleted / subsection.items.length) * 100
                        : 0

                    return (
                      <Accordion.Item
                        value={subsection.id}
                        key={subsection.title}
                        bg={'white'}
                      >
                        <CustomAccordionControl
                          item={subsection}
                          title={subsection.title}
                          completedItemsCount={subsectionCompleted}
                          totalItemsCount={subsection.items.length}
                          overdueItemsCount={subsectionOverdue}
                          progressPercentage={subsectionProgress}
                          viewMode={viewMode}
                          isSubsection
                        />

                        <Accordion.Panel>
                          <Stack gap="xs">
                            {subsection.items.map((item) => (
                              <ModuleItemCard
                                key={item.id}
                                item={item}
                                viewMode={viewMode}
                              />
                            ))}
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    )
                  })}
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </Box>
  )
}

interface ModuleItemCardProps {
  item: ModuleItem
  viewMode: 'student' | 'mentor' | 'admin'
}

const ModuleItemCard = ({ item, viewMode }: ModuleItemCardProps) => {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <IconFileText size={18} />
      case 'assignment':
        return <IconClipboard size={18} />
      case 'discussion':
        return <IconMessageCircle size={18} />
      case 'url':
        return <IconExternalLink size={18} />
      case 'file':
        return <IconFile size={18} />
      default:
        return <IconFileText size={18} />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'blue'
      case 'assignment':
        return 'orange'
      case 'discussion':
        return 'green'
      case 'url':
        return 'cyan'
      case 'file':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const isOverdue =
    item.type === 'assignment' && item.assignment?.dueDate
      ? new Date(item.assignment.dueDate) < new Date() &&
        getSubmissionStatus(item.assignment) === 'pending'
      : false

  const isCompleted =
    item.type === 'lesson'
      ? item.progress?.isCompleted
      : ['graded', 'ready-for-grading', 'submitted'].includes(
          getSubmissionStatus(item.assignment) || '',
        )

  return (
    <Link
      from={'/courses/$courseCode/modules'}
      to={`$itemId`}
      params={{ itemId: item.id }}
    >
      <Card
        withBorder
        radius="md"
        p="md"
        style={{
          cursor: 'pointer',
          borderLeft: `4px solid ${
            isOverdue
              ? theme.colors.red[5]
              : isCompleted
                ? theme.colors.green[5]
                : theme.colors[getContentTypeColor(item.type)][5]
          }`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.md,
          },
        }}
        bg={'background'}
      >
        <Group justify="space-between" align="flex-start">
          <Flex gap="sm" flex={1}>
            {/* Status Indicator */}
            {viewMode === 'student' && (
              <Box mt={2}>
                <CompletedStatusIcon
                  status={
                    item.type === 'lesson'
                      ? item.progress?.isCompleted
                        ? 'read'
                        : 'unread'
                      : getSubmissionStatus(item.assignment)
                  }
                />
              </Box>
            )}

            {/* Content Type Icon */}
            <ThemeIcon
              size="lg"
              variant="light"
              color={isOverdue ? 'red' : getContentTypeColor(item.type)}
              mt={2}
            >
              {getContentTypeIcon(item.type)}
            </ThemeIcon>

            {/* Content Details */}
            <Box flex={1}>
              <Group gap="xs" mb="xs">
                <Text fw={500} size="sm" lineClamp={2}>
                  {item.title}
                </Text>
                <Badge
                  size="xs"
                  variant="light"
                  color={getContentTypeColor(item.type)}
                >
                  {item.type}
                </Badge>
                {!item.published.isPublished && viewMode !== 'student' && (
                  <Badge size="xs" variant="light" color="gray">
                    Draft
                  </Badge>
                )}
              </Group>

              <Stack gap="xs">
                {/* Item Type Specific Info */}
                {item.type === 'lesson' ? (
                  <Group gap="xs">
                    <IconFileText size={14} color={theme.colors.gray[6]} />
                    <Text size="xs" c="dimmed">
                      Reading Material
                    </Text>
                    {item.progress?.completedAt && (
                      <>
                        <Text size="xs" c="dimmed">
                          •
                        </Text>
                        <Text size="xs" c="green">
                          Completed{' '}
                          {formatTimestampToDateTimeText(
                            item.progress.completedAt,
                            'on',
                          )}
                        </Text>
                      </>
                    )}
                  </Group>
                ) : item.assignment ? (
                  <Stack gap="4px">
                    <Group gap="xs">
                      <IconClock
                        size={14}
                        color={
                          isOverdue ? theme.colors.red[6] : theme.colors.gray[6]
                        }
                      />
                      <Text size="xs" c={isOverdue ? 'red' : 'dimmed'}>
                        Due:{' '}
                        {formatTimestampToDateTimeText(
                          item.assignment.dueDate || '',
                          'by',
                        )}
                      </Text>
                      {item.assignment.points && (
                        <>
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Text size="xs" c="dimmed">
                            {item.assignment.points} pts
                          </Text>
                        </>
                      )}
                    </Group>

                    {item.assignment.mode && (
                      <Group gap="xs">
                        <IconUsers size={14} color={theme.colors.gray[6]} />
                        <Text size="xs" c="dimmed">
                          {item.assignment.mode} submission
                        </Text>
                        {item.assignment.status && (
                          <>
                            <Text size="xs" c="dimmed">
                              •
                            </Text>
                            <Badge
                              size="xs"
                              variant="light"
                              color={
                                item.assignment.status === 'open'
                                  ? 'green'
                                  : 'red'
                              }
                            >
                              {item.assignment.status}
                            </Badge>
                          </>
                        )}
                      </Group>
                    )}
                  </Stack>
                ) : null}

                {/* Overdue Alert */}
                {isOverdue && viewMode === 'student' && (
                  <Alert
                    variant="light"
                    color="red"
                    icon={<IconAlertCircle size={14} />}
                    p="xs"
                  >
                    <Text size="xs">This assignment is overdue!</Text>
                  </Alert>
                )}
              </Stack>
            </Box>
          </Flex>

          {/* Action Button */}
          <Box>
            {viewMode === 'student' && item.type === 'assignment' && (
              <SubmitButton
                submissionStatus={
                  getSubmissionStatus(item.assignment) || 'pending'
                }
                onClick={() => {}}
                dueDate={item.assignment?.dueDate || ''}
                assignmentStatus={item.assignment?.status || 'open'}
                isPreview={authUser.role !== 'student'}
              />
            )}

            {viewMode === 'mentor' && item.type === 'assignment' && (
              <Tooltip label="View submissions">
                <ActionIcon variant="light" color="blue" radius="xl" size="lg">
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {viewMode === 'admin' && <AdminActions item={item} />}
          </Box>
        </Group>
      </Card>
    </Link>
  )
}

type CustomAccordionControlProps = {
  item: ModuleSection
  title: string
  completedItemsCount?: number
  totalItemsCount?: number
  overdueItemsCount?: number
  progressPercentage?: number
  isPreview?: boolean
  isSubsection?: boolean
  viewMode: 'student' | 'mentor' | 'admin'
  accordionControlProps?: AccordionControlProps
} & GroupProps

function CustomAccordionControl({
  item,
  title,
  completedItemsCount = 0,
  totalItemsCount = 0,
  overdueItemsCount = 0,
  progressPercentage = 0,
  isPreview = false,
  isSubsection = false,
  viewMode,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  return (
    <Box>
      <Group
        justify="space-between"
        align="center"
        h={'100%'}
        py={'md'}
        px={'sm'}
        {...props}
      >
        <Group wrap="nowrap" flex={1}>
          <Accordion.Control w={52} {...accordionControlProps} />

          <Group gap="sm" wrap="nowrap" flex={1}>
            <Box flex={1}>
              <Group gap="xs" mb="xs">
                <Title order={isSubsection ? 5 : 4} fw={600}>
                  {title}
                </Title>

                {!item.published.isPublished && viewMode !== 'student' && (
                  <Badge size="xs" variant="light" color="orange">
                    Draft
                  </Badge>
                )}

                {overdueItemsCount > 0 && viewMode === 'student' && (
                  <Indicator color="red" size={16} label={overdueItemsCount}>
                    <Badge size="xs" variant="light" color="red">
                      Overdue
                    </Badge>
                  </Indicator>
                )}
              </Group>

              {/* Progress Information */}
              {viewMode === 'student' && totalItemsCount > 0 && (
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">
                      Progress: {completedItemsCount}/{totalItemsCount} items
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </Group>
                  <Progress
                    value={progressPercentage}
                    size="sm"
                    radius="xl"
                    color={progressPercentage === 100 ? 'green' : 'blue'}
                  />
                </Box>
              )}

              {/* Published Date */}
              {viewMode !== 'student' && item.published.publishedAt && (
                <Text size="xs" c="dimmed" mt="xs">
                  Published:{' '}
                  {formatTimestampToDateTimeText(
                    item.published.publishedAt,
                    'on',
                  )}
                </Text>
              )}
            </Box>
          </Group>
        </Group>

        {viewMode === 'admin' && <AdminActions item={item} />}

        {viewMode === 'mentor' && (
          <Tooltip label="View section analytics">
            <ActionIcon variant="light" color="blue" radius="xl" size="lg">
              <IconChartBar size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Box>
  )
}

type AdminActionsProps = {
  item: ModuleItem | ModuleSection
}

const AdminActions = ({ item }: AdminActionsProps) => {
  const theme = useMantineTheme()
  const navigate = useNavigate()
  const handleDelete = () => {} //TODO: implement this
  const [opened, { open, close }] = useDisclosure()

  return (
    <Group gap="xs">
      <Menu
        shadow="md"
        width={200}
        opened={opened}
        onOpen={open}
        onClose={close}
      >
        <Menu.Target>
          <Tooltip
            label={item.published.isPublished ? 'Published' : 'Not Published'}
          >
            <ActionIcon
              variant={item.published.isPublished ? 'filled' : 'light'}
              color={item.published.isPublished ? 'green' : 'gray'}
              radius="xl"
              size="lg"
              onClick={(e) => {
                if (item.published.isPublished) {
                  e.stopPropagation()
                  navigate({
                    from: '/courses/$courseCode/modules',
                    to: `$itemId/publish`,
                    params: { itemId: item.id },
                    search: { scheduled: false, unpublish: true },
                  })
                } else {
                  open()
                }
              }}
            >
              {item.published.isPublished ? (
                <IconRubberStamp size={16} />
              ) : (
                <IconRubberStampOff size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Publish Actions</Menu.Label>
          {!item.published.isPublished && (
            <Menu.Item
              onClick={() => {
                navigate({
                  from: '/courses/$courseCode/modules',
                  to: `$itemId/publish`,
                  params: { itemId: item.id },
                  search: { scheduled: false, unpublish: false },
                })
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
          )}
          {!item.published.isPublished && (
            <Menu.Item
              onClick={() => {
                navigate({
                  from: '/courses/$courseCode/modules',
                  to: `$itemId/publish`,
                  params: { itemId: item.id },
                  search: { scheduled: true, unpublish: false },
                })
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
          )}
        </Menu.Dropdown>
      </Menu>

      <Tooltip label="Add new item">
        <ActionIcon
          variant="light"
          color="blue"
          radius="xl"
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            navigate({
              from: '/courses/$courseCode/modules',
              to: `$itemId/create`,
              params: { itemId: item.id },
            })
          }}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Tooltip>

      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="light" color="gray" radius="xl" size="lg">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Item Actions</Menu.Label>
          <Menu.Item
            leftSection={
              <IconEdit size={16} stroke={1.5} color={theme.colors.blue[6]} />
            }
            onClick={(e) => {
              e.stopPropagation()
              navigate({
                from: '/courses/$courseCode/modules',
                to: `$itemId/edit`,
                params: { itemId: item.id },
              })
            }}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} stroke={1.5} />}
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

export default ModulePanel
