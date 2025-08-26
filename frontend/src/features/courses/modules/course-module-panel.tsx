import CourseModules from '@/pages/shared/courses/$courseId/modules/course-modules.tsx'
import {
  Accordion,
  type AccordionControlProps,
  ActionIcon,
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
  ModuleData,
  ModuleSubsectionItemData,
} from '@/features/courses/modules/types.ts'
import type {
  AssignmentType,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  CompletedStatusIcon,
  ModuleItemIcon,
} from '@/components/icon-selector.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import SubmitButton from '@/components/submit-button.tsx'
import {
  IconDotsVertical,
  IconEdit,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react'

const moduleData: ModuleData[] = [
  {
    id: '1',
    title: 'Module 1',
    subsection: [
      {
        title: 'Readings',
        items: [
          {
            id: '',
            itemType: 'readings',
            readings: {
              title: 'Read',
              isRead: true,
            },
          },
          {
            id: '',
            itemType: 'readings',
            readings: {
              title: 'Not Read',
              isRead: true,
            },
          },
        ],
        id: '',
      },
      {
        title: 'Output',
        items: [
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[0],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[1],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[2],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[3],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[4],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[5],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[6],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[7],
          },
        ],
        id: '',
      },
    ],
  },
  {
    id: '2',
    title: 'Module 2',
    subsection: [
      {
        title: 'Output',
        items: [
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[0],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[1],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[2],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[3],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[4],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[5],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[6],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[7],
          },
        ],
        id: '',
      },
    ],
  },
  {
    id: '3',
    title: 'Module 3',
    subsection: [
      {
        title: 'Readings',
        items: [
          {
            id: '',
            itemType: 'readings',
            readings: {
              title: 'Read',
              isRead: true,
            },
          },
          {
            id: '',
            itemType: 'readings',
            readings: {
              title: 'Not Read',
              isRead: true,
            },
          },
        ],
        id: '',
      },
      {
        title: 'Output',
        items: [
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[0],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[1],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[2],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[3],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[4],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[5],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[6],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[7],
          },
        ],
        id: '',
      },
    ],
  },
  {
    id: '4',
    title: 'Module 4',
    subsection: [
      {
        title: 'Output',
        items: [
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[0],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[1],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[2],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[3],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[4],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[5],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[6],
          },
          {
            id: '',
            itemType: 'assignment',
            assignment: mockAssignmentsData[7],
          },
        ],
        id: '',
      },
    ],
  },
]

interface ModulePanelProps {
  allExpanded: boolean
}

const CourseModulePanel = ({ allExpanded }: ModulePanelProps) => {
  const theme = useMantineTheme()
  const [value, setValue] = useState<string[]>([])
  // Update expanded state when allExpanded prop changes
  useEffect(() => {
    if (allExpanded) {
      const allModuleIds = moduleData.map((module) => module.id)
      const allSubsectionLabels = moduleData.flatMap((module) =>
        module.subsection.map((sub) => sub.title),
      )
      setValue([...allModuleIds, ...allSubsectionLabels])
    } else {
      setValue([])
    }
  }, [allExpanded])

  const getCompletedItemsCount = (items: ModuleSubsectionItemData[]) => {
    return items.filter((item) => {
      if (item.itemType === 'readings' && item.readings) {
        return item.readings.isRead
      }
      if (item.itemType === 'assignment' && item.assignment) {
        const submissionStatus = getSubmissionStatus(item.assignment)
        return (
          submissionStatus === 'graded' ||
          submissionStatus === 'ready-for-grading'
        )
      }
    }).length
  }

  const items = moduleData.map((item) => (
    <Accordion.Item value={item.id} key={item.title} bg={'background'}>
      <AccordionControl
        title={item.title}
        completedItemsCount={getCompletedItemsCount(
          item.subsection.flatMap((sub) => sub.items),
        )}
        totalItemsCount={item.subsection.flatMap((sub) => sub.items).length}
      />
      <Accordion.Panel>
        <Accordion
          multiple
          value={value}
          onChange={setValue}
          chevronPosition="left"
          variant="separated"
          radius="md"
        >
          {item.subsection.map((subsection) => (
            <Accordion.Item
              value={subsection.title}
              key={subsection.title}
              bg={'white'}
            >
              <AccordionControl
                title={subsection.title}
                completedItemsCount={getCompletedItemsCount(subsection.items)}
                totalItemsCount={subsection.items.length}
              />

              {subsection.items.map((item) => (
                <Accordion.Panel
                  styles={{
                    content: {
                      padding: '8px',
                      borderTop: `1px solid ${theme.colors.gray[3]}`,
                    },
                  }}
                >
                  <AccordionControl
                    title={
                      item.readings?.title ?? item.assignment?.title ?? 'N/A'
                    }
                    isItem={true}
                    isRead={item.readings?.isRead ?? false}
                    isSubmission={item.itemType === 'assignment'}
                    assignmentType={item.assignment?.type}
                    submissionStatus={getSubmissionStatus(item.assignment)}
                    dueDate={item.assignment?.dueDate}
                  />
                </Accordion.Panel>
              ))}
            </Accordion.Item>
          ))}
        </Accordion>
      </Accordion.Panel>
    </Accordion.Item>
  ))

  return (
    <Accordion
      multiple
      value={value}
      onChange={setValue}
      chevronPosition="left"
      variant="separated"
      radius="md"
    >
      {items}
    </Accordion>
  )
}

type CustomAccordionControlProps = {
  title: string
  completedItemsCount?: number
  totalItemsCount?: number
  isItem?: boolean
  isSubmission?: boolean
  isRead?: boolean
  assignmentType?: AssignmentType
  submissionStatus?: SubmissionStatus
  dueDate?: string
  accordionControlProps?: AccordionControlProps
} & GroupProps

function AccordionControl({
  title,
  completedItemsCount,
  totalItemsCount,
  isItem,
  isSubmission,
  isRead,
  assignmentType,
  submissionStatus,
  dueDate,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  const { authUser } = useAuth('protected')

  const handleDelete = () => {}

  return (
    <Group
      justify="space-between"
      align="center"
      h={'100%'}
      p={!isItem ? 'lg' : 'xs'}
      {...props}
    >
      <Group
        gap={isItem ? 'md' : 'none'}
        ml={isItem ? 'xs' : 'none'}
        wrap="nowrap"
      >
        {!isItem && <Accordion.Control w={52} {...accordionControlProps} />}

        {isItem && authUser.role === 'student' && (
          <CompletedStatusIcon status={isRead ? 'read' : submissionStatus!} />
        )}

        <Group gap={'sm'} wrap="nowrap">
          {isItem && (
            <ModuleItemIcon type={assignmentType ?? 'readings'} stroke={1} />
          )}

          <Stack gap={'1'}>
            <Title order={4} fw={600}>
              {title}
            </Title>
            <Text size="md" c={'dark.4'} fw={400}>
              {isItem
                ? !isSubmission
                  ? 'View Content'
                  : dueDate
                    ? `Due: ${formatTimestampToDateTimeText(dueDate, 'by')}`
                    : 'Anytime'
                : ''}
            </Text>
          </Stack>
        </Group>
      </Group>
      <RoleComponentManager
        currentRole={authUser.role}
        roleRender={{
          student: (
            <>
              {isItem
                ? isSubmission && (
                    <SubmitButton
                      submissionStatus={submissionStatus!}
                      onClick={() => {}}
                      dueDate={''}
                      assignmentStatus={'open'}
                    />
                  )
                : totalItemsCount && (
                    <Text>
                      Completed: <strong>{completedItemsCount}</strong> out of{' '}
                      <strong>{totalItemsCount}</strong>
                    </Text>
                  )}
            </>
          ),
          admin: (
            <>
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
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                    >
                      Delete {assignmentType}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </>
          ),
        }}
      />
    </Group>
  )
}

export default CourseModulePanel
