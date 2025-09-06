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
  IconCalendarTime,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
} from '@tabler/icons-react'
import type { Role } from '@/integrations/api/client'
import { Link, useNavigate } from '@tanstack/react-router'
import { useDisclosure } from '@mantine/hooks'

interface ModulePanelProps {
  allExpanded: boolean
  module: Module
  isPreview?: boolean
}

const ModulePanel = ({
  allExpanded,
  module,
  isPreview = false,
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
                      key={item.id}
                      styles={{
                        content: {
                          padding: '8px',
                        },
                      }}
                    >
                      <ModuleItemCard item={item} isPreview={isPreview} />
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
  isPreview?: boolean
}

const ModuleItemCard = ({ item, isPreview = false }: ModuleItemCardProps) => {
  const { authUser } = useAuth('protected')
  const role: Role = isPreview ? 'student' : authUser.role
  const theme = useMantineTheme()

  return (
    <Link
      from={'/courses/$courseCode/modules'}
      to={`$itemId`}
      params={{ itemId: item.id }}
    >
      <Card
        withBorder
        radius="md"
        p="sm"
        style={{
          cursor: 'pointer',
          borderLeft: `3px solid ${item.type === 'lesson' ? theme.colors.blue[5] : theme.colors.green[5]}`,
        }}
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
    </Link>
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
  const navigate = useNavigate()
  const handleDelete = () => {} //TODO: implement this
  const [opened, { open, close }] = useDisclosure()
  return (
    <Group>
      <Menu
        shadow="md"
        width={200}
        opened={opened}
        onOpen={open}
        onClose={close}
      >
        <Menu.Target>
          <Tooltip label={item.published.isPublished ? 'Unpublish' : 'Publish'}>
            <ActionIcon
              variant="default"
              radius="lg"
              onClick={(e) => {
                if (item.published.isPublished) {
                  e.stopPropagation()
                  //TODO: handle unpublish
                } else {
                  open()
                }
              }}
            >
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
              }} //TODO: handle publish
              leftSection={
                <IconRubberStamp
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[5]}
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
              }} //TODO: handle schedule publish
              leftSection={
                <IconCalendarTime
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[5]}
                />
              }
            >
              Schedule Publish
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
      <Tooltip label="Add new">
        <ActionIcon
          variant="subtle"
          radius="lg"
          onClick={() => {
            navigate({
              from: '/courses/$courseCode/modules',
              to: `$itemId/create`,
              params: { itemId: item.id },
            })
          }}
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
            variant={'subtle'}
            leftSection={
              <IconEdit size={16} stroke={1.5} color={theme.colors.blue[5]} />
            }
            onClick={() => {
              navigate({
                from: '/courses/$courseCode/modules',
                to: `$itemId/edit`,
                params: { itemId: item.id },
              })
            }}
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
