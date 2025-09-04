import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
  Box,
  Card,
  Group,
  type GroupProps,
  Menu,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { getSubmissionStatus } from '@/utils/helpers.ts'
import type {
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CompletedStatusIcon } from '@/components/icon-selector.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import SubmitButton from '@/components/submit-button.tsx'
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
} from '@tabler/icons-react'
import type { Role } from '@/integrations/api/client'
import { mockModule } from '@/features/courses/mocks.ts'
import { Link } from '@tanstack/react-router'

interface ModulePanelProps {
  allExpanded: boolean
  module?: Module
  isPreview?: boolean
  courseCode?: string
}

const ModulePanel = ({
  allExpanded,
  module = mockModule,
  isPreview = false,
  courseCode,
}: ModulePanelProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

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

  const getCompletedItemsCount = (items: ModuleItem[]) => {
    return items.filter((item) => {
      if (item.type === 'lesson' && item.progress) {
        return item.progress.isCompleted
      }
      if (item.type === 'assignment' && item.assignment) {
        const submissionStatus = getSubmissionStatus(item.assignment)
        return (
          submissionStatus === 'graded' ||
          submissionStatus === 'ready-for-grading' ||
          submissionStatus === 'submitted'
        )
      }
      return false
    }).length
  }

  return (
    <Accordion
      multiple
      value={expandedItems}
      onChange={setExpandedItems}
      chevronPosition="left"
      variant="separated"
      radius="md"
    >
      {module.sections.map((section) => (
        <Accordion.Item
          value={section.id}
          key={section.title}
          bg={'background'}
        >
          <CustomAccordionControl
            item={section}
            title={section.title}
            completedItemsCount={getCompletedItemsCount(
              section.subsections?.flatMap((sub) => sub.items) || [],
            )}
            totalItemsCount={
              section.subsections?.flatMap((sub) => sub.items).length
            }
            isPreview={isPreview}
          />
          <Accordion.Panel>
            <Accordion
              multiple
              value={expandedItems}
              onChange={setExpandedItems}
              chevronPosition="left"
              variant="separated"
              radius="md"
            >
              {section.subsections?.map((subsection) => (
                <Accordion.Item
                  value={subsection.id}
                  key={subsection.title}
                  bg={'white'}
                >
                  <CustomAccordionControl
                    item={subsection}
                    title={subsection.title}
                    completedItemsCount={getCompletedItemsCount(
                      subsection.items,
                    )}
                    totalItemsCount={subsection.items.length}
                    isPreview={isPreview}
                  />

                  {subsection.items.map((item) => (
                    <Accordion.Panel
                      styles={{
                        content: {
                          padding: '8px',
                        },
                      }}
                    >
                      <ModuleItemCard
                        key={item.id}
                        item={item}
                        onItemClick={() => {
                          /* TODO: Handle item click */
                        }}
                        isPreview={isPreview}
                      />
                    </Accordion.Panel>
                  ))}
                </Accordion.Item>
              ))}
            </Accordion>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

interface ModuleItemCardProps {
  item: ModuleItem
  onItemClick: () => void
  isPreview?: boolean
}

const ModuleItemCard = ({
  item,
  onItemClick,
  isPreview = false,
}: ModuleItemCardProps) => {
  const { authUser } = useAuth('protected')
  const role: Role = isPreview ? 'student' : authUser.role
  const theme = useMantineTheme()

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        cursor: 'pointer',
        borderLeft: `3px solid ${item.type === 'lesson' ? theme.colors.blue[5] : theme.colors.green[5]}`,
      }}
      onClick={onItemClick}
      bg={'background'}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          {role === 'student' && (
            <CompletedStatusIcon
              status={
                item.type === 'lesson'
                  ? item.progress?.isCompleted
                    ? 'read'
                    : 'unread'
                  : getSubmissionStatus(item.assignment)
              }
            />
          )}

          <Box>
            <Text fw={500}>{item.title}</Text>
            <Text size="sm" c="dimmed">
              {item.type === 'lesson'
                ? 'Reading Material'
                : `Due: ${formatTimestampToDateTimeText(item.assignment?.dueDate || '', 'by')}`}
            </Text>
          </Box>
        </Group>

        <RoleComponentManager
          currentRole={role}
          roleRender={{
            student: (
              <>
                {item.type === 'assignment' && (
                  <SubmitButton
                    submissionStatus={
                      getSubmissionStatus(item.assignment) || 'pending'
                    }
                    onClick={() => {}}
                    dueDate={item.assignment?.dueDate || ''}
                    assignmentStatus={item.assignment?.status || 'open'}
                    isPreview={isPreview}
                  />
                )}
              </>
            ),
            admin: <AdminActions item={item} />,
          }}
        />
      </Group>
    </Card>
  )
}

type CustomAccordionControlProps = {
  item: ModuleSection
  title: string
  completedItemsCount?: number
  totalItemsCount?: number
  isPreview?: boolean
  accordionControlProps?: AccordionControlProps
} & GroupProps

function CustomAccordionControl({
  item,
  title,
  completedItemsCount,
  totalItemsCount,
  isPreview = false,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  const { authUser } = useAuth('protected')
  const role: Role = isPreview ? 'student' : authUser.role

  return (
    <Group
      justify="space-between"
      align="center"
      h={'100%'}
      py={'md'}
      px={'sm'}
      {...props}
    >
      <Group wrap="nowrap">
        <Accordion.Control w={52} {...accordionControlProps} />

        <Group gap={'sm'} wrap="nowrap">
          <Stack gap={'1'}>
            <Title order={4} fw={600}>
              {title}
            </Title>
          </Stack>
        </Group>
      </Group>
      {role === 'admin' && <AdminActions item={item} />}
    </Group>
  )
}

type AdminActionsProps = {
  item: ModuleItem | ModuleSection
}

const AdminActions = ({ item }: AdminActionsProps) => {
  const theme = useMantineTheme()
  const handleDelete = () => {} //TODO: implement this
  return (
    <Group>
      <Tooltip label={item.published.isPublished ? 'Published' : 'Draft'}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="default" radius="lg">
              <ThemeIcon
                color={item.published.isPublished ? 'green' : 'gray'}
                size="md"
                radius="xl"
              >
                {item.published.isPublished ? (
                  <IconRubberStamp size={20} />
                ) : (
                  <IconRubberStampOff size={20} />
                )}
              </ThemeIcon>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!item.published.isPublished && (
              <Menu.Item
                component={Link}
                to={`./${item}/publish`}
                onClick={() => {}}
              >
                Publish Now
              </Menu.Item>
            )}
            {!item.published.isPublished && (
              <Menu.Item
                component={Link}
                to={`./${item}/publish`}
                onClick={() => {}}
              >
                Schedule Publish
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Tooltip>
      <Tooltip label="Add new">
        <ActionIcon
          component={Link}
          to={`./${item.id}/create`}
          variant="subtle"
          radius="lg"
        >
          <IconPlus size={20} />
        </ActionIcon>
      </Tooltip>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="default" radius="lg">
            <IconDotsVertical size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>
          <Menu.Item
            component={Link}
            to={`./${item}/edit`}
            leftSection={
              <IconEdit size={16} stroke={1.5} color={theme.colors.blue[5]} />
            }
          >
            Edit
          </Menu.Item>
          <Menu.Item //TODO: implement this
            leftSection={
              <IconTrash size={16} stroke={1.5} color={theme.colors.red[5]} />
            }
          >
            Delete Item
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

export default ModulePanel
