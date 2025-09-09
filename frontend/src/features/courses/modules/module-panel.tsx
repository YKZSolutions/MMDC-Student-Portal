import SubmitButton from '@/components/submit-button.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import {
  getCompletedItemsCount,
  getOverdueItemsCount,
  getSubmissionStatus,
} from '@/utils/helpers.ts'
import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
  type GroupProps,
  Menu,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import {
  IconCalendarTime,
  IconChartBar,
  IconClipboard,
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
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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
    <Accordion
      multiple
      value={expandedItems}
      onChange={setExpandedItems}
      chevronPosition="left"
      variant="separated"
      radius="md"
      styles={{
        chevron: {
          padding: theme.spacing.sm,
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
            py={'sm'}
            value={section.id}
            key={section.title}
            bg={'background'}
            className="ring-1 ring-inset ring-gray-200"
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
                  chevron: {
                    padding: theme.spacing.sm,
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
                      className="ring-1 ring-inset ring-gray-100"
                      py={'sm'}
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
  )
}

interface ModuleItemCardProps {
  item: ModuleItem
  viewMode: 'student' | 'mentor' | 'admin'
}

const ModuleItemCard = ({ item, viewMode }: ModuleItemCardProps) => {
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()

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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <IconFileText size={16} />
      case 'assignment':
        return <IconClipboard size={16} />
      case 'discussion':
        return <IconMessageCircle size={16} />
      case 'url':
        return <IconExternalLink size={16} />
      case 'file':
        return <IconFile size={16} />
      default:
        return <IconFileText size={16} />
    }
  }

  const navigateToItem = () => {
    navigate({
      from: '/courses/$courseCode/modules',
      to: `$itemId`,
      params: { itemId: item.id },
    })
  }

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={(e) => {
        e.stopPropagation()
        navigateToItem()
      }}
    >
      <Group align="center" justify="space-between" wrap="nowrap">
        {/* Icon + Title */}
        <Group align="center" gap="sm" wrap="nowrap" flex={1}>
          <ThemeIcon
            size="md"
            variant="light"
            color={isOverdue ? 'red' : isCompleted ? 'green' : 'gray'}
          >
            {getContentTypeIcon(item.type)}
          </ThemeIcon>

          <Box flex={1}>
            <Group gap="xs" mb={4}>
              <Text fw={500} size="sm" lineClamp={2}>
                {item.title}
              </Text>

              {item.type && (
                <Badge size="xs" variant="light" color="gray">
                  {item.type}
                </Badge>
              )}

              {!item.published.isPublished && viewMode !== 'student' && (
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
            {item.type === 'lesson' && (
              <Text size="xs" c="dimmed">
                Reading Material
                {item.progress?.completedAt && (
                  <>
                    {' '}
                    • Completed{' '}
                    {formatTimestampToDateTimeText(
                      item.progress.completedAt,
                      'on',
                    )}
                  </>
                )}
              </Text>
            )}

            {item.assignment && (
              <Text size="xs" c={isOverdue ? 'red' : 'dimmed'}>
                Due{' '}
                {formatTimestampToDateTimeText(
                  item.assignment.dueDate || '',
                  'by',
                )}{' '}
                • {item.assignment.points} pts
              </Text>
            )}
          </Box>
        </Group>

        {/* Right-side Actions */}
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
              <ActionIcon variant="subtle" color="blue" radius="xl" size="md">
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {viewMode === 'admin' && <AdminActions item={item} />}
        </Box>
      </Group>
    </Card>
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
  isSubsection = false,
  viewMode,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  return (
    <Accordion.Control {...accordionControlProps}>
      <Group wrap="nowrap" flex={1}>
        <Stack gap={'xs'} flex={1}>
          <Group gap="xs" mb={4}>
            <Title order={isSubsection ? 5 : 4} fw={600}>
              {title}
            </Title>

            {!item.published.isPublished && viewMode !== 'student' && (
              <Badge size="xs" variant="outline" color="orange">
                Draft
              </Badge>
            )}

            {overdueItemsCount > 0 && viewMode === 'student' && (
              <Badge size="xs" variant="filled" color="red">
                {overdueItemsCount} Overdue
              </Badge>
            )}
          </Group>

          {viewMode === 'student' && totalItemsCount > 0 && (
            <Progress
              value={progressPercentage}
              size="sm"
              radius="xl"
              color={progressPercentage === 100 ? 'green' : 'blue'}
            />
          )}

          {viewMode !== 'student' && item.published.publishedAt && (
            <Text size="xs" c="dimmed">
              Published{' '}
              {formatTimestampToDateTimeText(item.published.publishedAt, 'on')}
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

        {viewMode === 'admin' && <AdminActions item={item} />}
      </Group>
    </Accordion.Control>
  )
}

type AdminActionsProps = {
  item: ModuleItem | ModuleSection
}

const AdminActions = ({ item }: AdminActionsProps) => {
  const theme = useMantineTheme()
  const navigate = useNavigate()
  const handleDelete = () => {} //TODO: implement this
  const [publishMenuOpen, setPublishMenuOpen] = useState(false)
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)

  return (
    <Group gap="xs">
      <Menu
        shadow="md"
        width={200}
        opened={publishMenuOpen}
        onClose={() => setPublishMenuOpen(false)}
      >
        <Menu.Target>
          <Tooltip
            label={item.published.isPublished ? 'Published' : 'Not Published'}
          >
            <ActionIcon
              variant={'light'}
              color={item.published.isPublished ? 'green' : 'gray'}
              radius="xl"
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                if (item.published.isPublished) {
                  navigate({
                    from: '/courses/$courseCode/modules',
                    to: `$itemId/publish`,
                    params: { itemId: item.id },
                    search: { scheduled: false, unpublish: true },
                  })
                } else {
                  setPublishMenuOpen(true)
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
              onClick={(e) => {
                e.stopPropagation()
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
              onClick={(e) => {
                e.stopPropagation()
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

      <Menu
        shadow="md"
        width={200}
        opened={actionsMenuOpen}
        onClose={() => setActionsMenuOpen(false)}
      >
        <Menu.Target>
          <ActionIcon
            variant="light"
            color="gray"
            radius="xl"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              setActionsMenuOpen(true)
            }}
          >
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
