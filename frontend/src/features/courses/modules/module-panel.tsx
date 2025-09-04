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
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { getSubmissionStatus } from '@/utils/helpers.ts'
import type { Module, ModuleItem } from '@/features/courses/modules/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { CompletedStatusIcon } from '@/components/icon-selector.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import SubmitButton from '@/components/submit-button.tsx'
import {
  IconDotsVertical,
  IconEdit,
  IconSettings,
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
            itemId={section.id}
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
                    itemId={subsection.id}
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
            admin: (
              <Group gap="xs">
                <ActionIcon
                  component={Link}
                  variant="subtle"
                  radius="lg"
                  to={`./${item.id}/edit`}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" radius="lg">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          }}
        />
      </Group>
    </Card>
  )
}

type CustomAccordionControlProps = {
  itemId: string
  title: string
  completedItemsCount?: number
  totalItemsCount?: number
  isPreview?: boolean
  accordionControlProps?: AccordionControlProps
} & GroupProps

function CustomAccordionControl({
  itemId,
  title,
  completedItemsCount,
  totalItemsCount,
  isPreview = false,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  const { authUser } = useAuth('protected')
  const role: Role = isPreview ? 'student' : authUser.role

  const handleDelete = () => {}

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
      {role === 'admin' && (
        <Group>
          <ActionIcon
            component={Link}
            to={`./${itemId}/edit`}
            variant="subtle"
            radius="lg"
          >
            <IconEdit size={'70%'} />
          </ActionIcon>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="default" radius="lg">
                <IconDotsVertical size={'70%'} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item leftSection={<IconSettings size={14} />}>
                Settings
              </Menu.Item>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                Delete Item
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
    </Group>
  )
}

export default ModulePanel
