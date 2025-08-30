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
import { mockAssignmentsData } from '@/pages/shared/courses/$courseId/assignments/course-assignments.tsx'
import type {
  CourseModule,
  ModuleItem,
} from '@/features/courses/modules/types.ts'
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

export const moduleData: CourseModule[] = [
  {
    id: 'mod_1',
    courseId: 'course_1',
    title: 'Module 1: Introduction to Biology',
    position: 1,
    sections: [
      {
        id: 'sec_1',
        title: 'Readings',
        position: 1,
        items: [
          {
            id: 'item_1',
            type: 'reading',
            title: 'Chapter 1: Cell Structure',
            position: 1,
            content: {
              id: 'read_1',
              title: 'Chapter 1: Cell Structure',
              fileUrl: '/uploads/cell-structure.pdf',
              isCompleted: true,
            },
          },
          {
            id: 'item_2',
            type: 'reading',
            title: 'Chapter 2: DNA Replication',
            position: 2,
            content: {
              id: 'read_2',
              title: 'Chapter 2: DNA Replication',
              fileUrl: '/uploads/dna-replication.pdf',
              isCompleted: false,
            },
          },
        ],
      },
      {
        id: 'sec_2',
        title: 'Assignments',
        position: 2,
        items: [
          {
            id: 'item_3',
            type: 'assignment',
            title: 'Cell Biology Quiz',
            position: 1,
            assignment: mockAssignmentsData[0],
          },
          {
            id: 'item_4',
            type: 'assignment',
            title: 'DNA Assignment',
            position: 2,
            assignment: mockAssignmentsData[1],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_2',
    courseId: 'course_1',
    title: 'Module 2: Genetics',
    position: 2,
    sections: [
      {
        id: 'sec_3',
        title: 'Assignments',
        position: 1,
        items: [
          {
            id: 'item_5',
            type: 'assignment',
            title: 'Genetics Problems',
            position: 1,
            assignment: mockAssignmentsData[2],
          },
          {
            id: 'item_6',
            type: 'assignment',
            title: 'Heredity Quiz',
            position: 2,
            assignment: mockAssignmentsData[3],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_3',
    courseId: 'course_1',
    title: 'Module 3: Ecology',
    position: 3,
    sections: [
      {
        id: 'sec_4',
        title: 'Readings',
        position: 1,
        items: [
          {
            id: 'item_7',
            type: 'reading',
            title: 'Chapter 5: Ecosystems',
            position: 1,
            content: {
              id: 'read_3',
              title: 'Chapter 5: Ecosystems',
              fileUrl: '/uploads/ecosystems.pdf',
              isCompleted: true,
            },
          },
          {
            id: 'item_8',
            type: 'reading',
            title: 'Chapter 6: Conservation',
            position: 2,
            content: {
              id: 'read_4',
              title: 'Chapter 6: Conservation',
              fileUrl: '/uploads/conservation.pdf',
              isCompleted: false,
            },
          },
        ],
      },
      {
        id: 'sec_5',
        title: 'Assignments',
        position: 2,
        items: [
          {
            id: 'item_9',
            type: 'assignment',
            title: 'Ecosystem Analysis',
            position: 1,
            assignment: mockAssignmentsData[4],
          },
          {
            id: 'item_10',
            type: 'assignment',
            title: 'Conservation Project',
            position: 2,
            assignment: mockAssignmentsData[5],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_4',
    courseId: 'course_1',
    title: 'Module 4: Evolution',
    position: 4,
    sections: [
      {
        id: 'sec_6',
        title: 'Assignments',
        position: 1,
        items: [
          {
            id: 'item_11',
            type: 'assignment',
            title: 'Evolution Timeline',
            position: 1,
            assignment: mockAssignmentsData[6],
          },
          {
            id: 'item_12',
            type: 'assignment',
            title: 'Natural Selection Report',
            position: 2,
            assignment: mockAssignmentsData[7],
          },
        ],
      },
    ],
  },
]

interface ModulePanelProps {
  allExpanded: boolean
  modules?: CourseModule[]
  isPreview?: boolean
}

const ModuleListPanel = ({
  allExpanded,
  modules: externalModules,
  isPreview = false,
}: ModulePanelProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const modules = externalModules || moduleData

  // Update expanded state when allExpanded prop changes
  useEffect(() => {
    if (allExpanded) {
      const allModuleIds = modules.map((module) => module.id)
      const allSectionIds = modules.flatMap((module) =>
        module.sections.map((section) => section.id),
      )
      setExpandedItems([...allModuleIds, ...allSectionIds])
    } else {
      setExpandedItems([])
    }
  }, [allExpanded])

  const getCompletedItemsCount = (items: ModuleItem[]) => {
    return items.filter((item) => {
      if (item.type === 'reading' && item.content) {
        return item.content.isCompleted
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
      {modules.map((module) => (
        <Accordion.Item value={module.id} key={module.title} bg={'background'}>
          <CustomAccordionControl
            title={module.title}
            completedItemsCount={getCompletedItemsCount(
              module.sections.flatMap((sub) => sub.items),
            )}
            totalItemsCount={module.sections.flatMap((sub) => sub.items).length}
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
              {module.sections.map((subsection) => (
                <Accordion.Item
                  value={subsection.id}
                  key={subsection.title}
                  bg={'white'}
                >
                  <CustomAccordionControl
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
        borderLeft: `3px solid ${item.type === 'reading' ? theme.colors.blue[5] : theme.colors.green[5]}`,
      }}
      onClick={onItemClick}
      bg={'background'}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          {role === 'student' && (
            <CompletedStatusIcon
              status={
                item.type === 'reading'
                  ? item.content?.isCompleted
                    ? 'read'
                    : 'unread'
                  : getSubmissionStatus(item.assignment)
              }
            />
          )}

          <Box>
            <Text fw={500}>{item.title}</Text>
            <Text size="sm" c="dimmed">
              {item.type === 'reading'
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
                <ActionIcon variant="subtle" radius="lg">
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
  title: string
  completedItemsCount?: number
  totalItemsCount?: number
  isPreview?: boolean
  accordionControlProps?: AccordionControlProps
} & GroupProps

function CustomAccordionControl({
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
          <ActionIcon variant="subtle" radius="lg">
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

export default ModuleListPanel
