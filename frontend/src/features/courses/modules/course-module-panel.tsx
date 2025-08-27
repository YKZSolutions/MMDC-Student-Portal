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
  CourseModule,
  ModuleItem,
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

const moduleData: CourseModule[] = [
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
}

const CourseModulePanel = ({ allExpanded }: ModulePanelProps) => {
  const theme = useMantineTheme()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Update expanded state when allExpanded prop changes
  useEffect(() => {
    if (allExpanded) {
      const allModuleIds = moduleData.map((module) => module.id)
      const allSectionIds = moduleData.flatMap((module) =>
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

  const modules = moduleData.map((module) => (
    <Accordion.Item value={module.id} key={module.title} bg={'background'}>
      <CustomAccordionControl
        title={module.title}
        completedItemsCount={getCompletedItemsCount(
          module.sections.flatMap((sub) => sub.items),
        )}
        totalItemsCount={module.sections.flatMap((sub) => sub.items).length}
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
                  <CustomAccordionControl
                    title={
                      item.content?.title ?? item.assignment?.title ?? 'N/A'
                    }
                    isItem={true}
                    isRead={item.content?.isCompleted ?? false}
                    isSubmission={item.type === 'assignment'}
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
      value={expandedItems}
      onChange={setExpandedItems}
      chevronPosition="left"
      variant="separated"
      radius="md"
    >
      {modules}
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

function CustomAccordionControl({
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
