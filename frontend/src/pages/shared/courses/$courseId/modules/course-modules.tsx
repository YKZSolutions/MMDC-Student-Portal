import {
  Group,
  Stack,
  Title,
  Button,
  Text,
  Accordion,
  useMantineTheme,
  ActionIcon,
  Menu,
} from '@mantine/core'
import {
  IconBook,
  IconCircle,
  IconCircleCheck,
  IconDotsVertical,
  IconEdit,
  IconFile,
  IconFlag,
  IconLock,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUrgent,
  IconWriting,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import SubmitButton from '@/components/submit-button.tsx'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ButtonWithModal from '@/components/btn-w-modal.tsx'
import CourseCreationProcessModal from '@/features/courses/course-editor/course-creation-process-modal.tsx'
import type {
  Assignment,
  AssignmentSubmissionReport,
  AssignmentType,
  StudentAssignment,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'
import {
  getFutureDate,
  getPastDate,
  getSubmissionStatus,
} from '@/utils/helpers.ts'
import { mockAssignmentsData } from '@/pages/shared/courses/$courseId/assignments/course-assignments.tsx'

const CourseModules = () => {
  const { authUser } = useAuth('protected')
  const [allExpanded, setAllExpanded] = useState(false)

  const toggleExpandAll = () => {
    setAllExpanded((prev) => !prev)
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title>Course Name | Course Modules</Title>
        <Group align="center">
          <Button onClick={toggleExpandAll} w={120} variant={''}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          {authUser.role === 'admin' && (
            <ButtonWithModal
              label={'Add New Readings'}
              icon={<IconPlus />}
              modalComponent={CourseCreationProcessModal}
            />
          )}
        </Group>
      </Group>
      <Stack>
        <ModuleCard allExpanded={allExpanded} />
      </Stack>
    </Stack>
  )
}

const moduleData: ModuleData[] = [
  {
    id: '1',
    title: 'Module 1',
    description: 'Description of Module 1',
    subsection: [
      {
        title: 'Readings',
        description: 'Description of Readings',
        items: [
          {
            itemType: 'readings',
            readings: {
              title: 'Read',
              description: 'Description of Readings 1',
              isRead: true,
            },
          },
          {
            itemType: 'readings',
            readings: {
              title: 'Not Read',
              description: 'Description of Readings 1',
              isRead: true,
            },
          },
        ],
        id: '',
      },
      {
        title: 'Output',
        description: 'Description of Output',
        items: [
          { itemType: 'assignment', assignment: mockAssignmentsData[0] },
          { itemType: 'assignment', assignment: mockAssignmentsData[1] },
          { itemType: 'assignment', assignment: mockAssignmentsData[2] },
          { itemType: 'assignment', assignment: mockAssignmentsData[3] },
          { itemType: 'assignment', assignment: mockAssignmentsData[4] },
          { itemType: 'assignment', assignment: mockAssignmentsData[5] },
          { itemType: 'assignment', assignment: mockAssignmentsData[6] },
          { itemType: 'assignment', assignment: mockAssignmentsData[7] },
        ],
        id: '',
      },
    ],
  },
  {
    id: '2',
    title: 'Module 2',
    description: 'Description of Module 2',
    subsection: [
      {
        title: 'Output',
        description: 'Description of Output',
        items: [
          { itemType: 'assignment', assignment: mockAssignmentsData[0] },
          { itemType: 'assignment', assignment: mockAssignmentsData[1] },
          { itemType: 'assignment', assignment: mockAssignmentsData[2] },
          { itemType: 'assignment', assignment: mockAssignmentsData[3] },
          { itemType: 'assignment', assignment: mockAssignmentsData[4] },
          { itemType: 'assignment', assignment: mockAssignmentsData[5] },
          { itemType: 'assignment', assignment: mockAssignmentsData[6] },
          { itemType: 'assignment', assignment: mockAssignmentsData[7] },
        ],
        id: '',
      },
    ],
  },
  {
    id: '3',
    title: 'Module 3',
    description: 'Description of Module 3',
    subsection: [
      {
        title: 'Readings',
        description: 'Description of Readings',
        items: [
          {
            itemType: 'readings',
            readings: {
              title: 'Read',
              description: 'Description of Readings 1',
              isRead: true,
            },
          },
          {
            itemType: 'readings',
            readings: {
              title: 'Not Read',
              description: 'Description of Readings 1',
              isRead: true,
            },
          },
        ],
        id: '',
      },
      {
        title: 'Output',
        description: 'Description of Output',
        items: [
          { itemType: 'assignment', assignment: mockAssignmentsData[0] },
          { itemType: 'assignment', assignment: mockAssignmentsData[1] },
          { itemType: 'assignment', assignment: mockAssignmentsData[2] },
          { itemType: 'assignment', assignment: mockAssignmentsData[3] },
          { itemType: 'assignment', assignment: mockAssignmentsData[4] },
          { itemType: 'assignment', assignment: mockAssignmentsData[5] },
          { itemType: 'assignment', assignment: mockAssignmentsData[6] },
          { itemType: 'assignment', assignment: mockAssignmentsData[7] },
        ],
        id: '',
      },
    ],
  },
  {
    id: '4',
    title: 'Module 4',
    description: 'Description of Module 4',
    subsection: [
      {
        title: 'Output',
        description: 'Description of Output',
        items: [
          { itemType: 'assignment', assignment: mockAssignmentsData[0] },
          { itemType: 'assignment', assignment: mockAssignmentsData[1] },
          { itemType: 'assignment', assignment: mockAssignmentsData[2] },
          { itemType: 'assignment', assignment: mockAssignmentsData[3] },
          { itemType: 'assignment', assignment: mockAssignmentsData[4] },
          { itemType: 'assignment', assignment: mockAssignmentsData[5] },
          { itemType: 'assignment', assignment: mockAssignmentsData[6] },
          { itemType: 'assignment', assignment: mockAssignmentsData[7] },
        ],
        id: '',
      },
    ],
  },
]

interface ModuleBase {
  id: string
  title: string
  description: string
}

interface ModuleData extends ModuleBase {
  subsection: ModuleSubsectionData[]
}

interface ModuleSubsectionData extends ModuleBase {
  items: ModuleSubsectionItemData[]
}

// TODO: add more fields
interface Readings {
  title: string
  description: string
  isRead: boolean
}

type ContentType = 'readings' | 'assignment'

interface ModuleSubsectionItemData {
  itemType: ContentType
  readings?: Readings
  assignment?: Assignment | StudentAssignment
}

const getIcon = (type: ContentType | AssignmentType) => {
  switch (type) {
    case 'readings':
      return <IconBook size={20} />
    case 'assignment':
      return <IconPencil size={20} />
    case 'draft':
      return <IconEdit size={20} />
    case 'milestone':
      return <IconFlag size={20} />
    case 'other':
      return <IconWriting size={20} />
    default:
      return null
  }
}

interface AccordionLabelProps {
  label: string
  description: string
  completedItemsCount?: number
  totalItemsCount?: number
  isItem?: boolean
  isSubmission?: boolean
  isRead?: boolean
  assignmentType?: AssignmentType
  submissionStatus?: SubmissionStatus
}

function AccordionLabel({
  label,
  description,
  completedItemsCount,
  totalItemsCount,
  isItem,
  isSubmission,
  isRead,
  assignmentType,
  submissionStatus,
}: AccordionLabelProps) {
  const { authUser } = useAuth('protected')

  const handleDelete = () => {}

  const getCompletedStatusIcon = (status: string) => {
    if (
      status === 'ready-for-grading' ||
      status === 'graded' ||
      status === 'read'
    ) {
      return <IconCircleCheck size={18} color="green" />
    }

    return <IconCircle size={18} color="gray" />
  }

  return (
    <Group
      justify="space-between"
      align="center"
      h={'100%'}
      mt={isItem ? 'xs' : 'none'}
    >
      <Group wrap="nowrap">
        {isItem &&
          authUser.role === 'student' &&
          getCompletedStatusIcon(isRead ? 'read' : submissionStatus!)}
        {isItem && getIcon(assignmentType ?? 'readings')}
        <Stack gap={'0'}>
          <Text>{label}</Text>
          <Text size="sm" c="dimmed" fw={400}>
            {description}
          </Text>
        </Stack>
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

interface ModuleCardProps {
  allExpanded: boolean
}

const ModuleCard = ({ allExpanded }: ModuleCardProps) => {
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
    <Accordion.Item value={item.id} key={item.title}>
      <Accordion.Control aria-label={item.title}>
        <AccordionLabel
          label={item.title}
          description={item.description}
          completedItemsCount={getCompletedItemsCount(
            item.subsection.flatMap((sub) => sub.items),
          )}
          totalItemsCount={item.subsection.flatMap((sub) => sub.items).length}
        />
      </Accordion.Control>
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
            <Accordion.Item value={subsection.title} key={subsection.title}>
              <Accordion.Control aria-label={subsection.title}>
                <AccordionLabel
                  label={subsection.title}
                  description={subsection.description}
                  completedItemsCount={getCompletedItemsCount(subsection.items)}
                  totalItemsCount={subsection.items.length}
                />
              </Accordion.Control>
              {subsection.items.map((item) => (
                <Accordion.Panel
                  style={{ borderTop: `1px solid ${theme.colors.gray[3]}` }}
                  m={0}
                  p={0}
                >
                  <AccordionLabel
                    label={
                      item.readings?.title ?? item.assignment?.title ?? 'N/A'
                    }
                    description={
                      item.readings?.description ??
                      item.assignment?.description ??
                      'N/A'
                    }
                    isItem={true}
                    isRead={item.readings?.isRead ?? false}
                    assignmentType={item.assignment?.type}
                    submissionStatus={getSubmissionStatus(item.assignment)}
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

export default CourseModules
