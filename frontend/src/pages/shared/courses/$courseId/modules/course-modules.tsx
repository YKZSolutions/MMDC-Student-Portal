import {
  Group,
  Stack,
  Title,
  Button,
  Text,
  Accordion,
  useMantineTheme,
  ActionIcon,
  Menu
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
  IconPencil, IconPlus,
  IconSettings,
  IconTrash,
  IconUrgent,
  IconWriting,
} from '@tabler/icons-react'
import { useState, useEffect } from "react";
import SubmitButton from '@/components/submit-button.tsx'
import RoleComponentManager from "@/components/role-component-manager.tsx";
import {useAuth} from "@/features/auth/auth.hook.ts";
import ButtonWithModal from '@/components/btn-w-modal.tsx'
import CourseCreationProcessModal from '@/features/courses/course-editor/course-creation-process-modal.tsx'
import type {
  AssignmentType,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'

const CourseModules = () => {
  const { authUser } = useAuth('protected')
  const [allExpanded, setAllExpanded] = useState(false);
  
  const toggleExpandAll = () => {
    setAllExpanded(prev => !prev);
  };

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title>Course Name | Course Modules</Title>
        <Group align="center">
          <Button onClick={toggleExpandAll} w={120}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          {authUser.role === 'admin' && (
            <ButtonWithModal
              label={'Add New Content'}
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
    label: 'Module 1',
    description: 'Description of Module 1',
    subsection: [
      {
        label: 'Readings',
        description: 'Description of Readings',
        items: [
          {
            label: 'Readings 1',
            description: 'Description of Readings 1',
            isRead: true,
            isSubmission: false,
            id: '1',
          },
        ],
        id: '1',
      },
      {
        label: 'Output',
        description: 'Description of Output',
        items: [
          {
            label: 'Assignment 1',
            description: 'Description of Assignment 1',
            assignmentType: 'assignment',
            isSubmission: true,
            submissionStatus: 'pending',
            id: '1',
          },
        ],
        id: '1',
      },
    ],
  },
  {
    id: '2',
    label: 'Module 2',
    description: 'Description of Module 2',
    subsection: [
      {
        label: 'Output',
        description: 'Description of Output',
        items: [
          {
            label: 'Draft',
            description: 'Description of Draft',
            assignmentType: 'draft',
            isSubmission: true,
            submissionStatus: 'pending',
            id: '1',
          },
          {
            label: 'Milestone',
            description: 'Description of Milestone',
            assignmentType: 'milestone',
            isSubmission: true,
            submissionStatus: 'pending',
            id: '1',
          },
        ],
        id: '1',
      },
    ],
  },
  {
    id: '3',
    label: 'Module 3',
    description: 'Description of Module 3',
    subsection: [
      {
        label: 'Readings',
        description: 'Description of Readings',
        items: [
          {
            label: 'Readings 1',
            description: 'Description of Readings 1',
            isRead: true,
            id: '',
            isSubmission: false,
          },
        ],
        id: '',
      },
      {
        label: 'Output',
        description: 'Description of Output',
        items: [
          {
            label: 'Draft',
            description: 'Description of Draft',
            assignmentType: 'draft',
            isSubmission: true,
            submissionStatus: 'pending',
            id: '',
          },
        ],
        id: '',
      },
    ],
  },
  {
    id: '4',
    label: 'Module 4',
    description: 'Description of Module 4',
    subsection: [
      {
        label: 'Output',
        description: 'Description of Output',
        items: [
          {
            label: 'Draft Revision',
            description: 'Description of Draft',
            assignmentType: 'draft',
            submissionStatus: 'pending',
            id: '',
            isSubmission: true,
          },
          {
            label: 'Milestone',
            description: 'Description of Milestone',
            assignmentType: 'milestone',
            submissionStatus: 'pending',
            id: '',
            isSubmission: true,
          },
          {
            label: 'Survey',
            description: 'Description of Survey',
            assignmentType: 'other',
            submissionStatus: 'pending',
            id: '',
            isSubmission: true,
          },
        ],
        id: '',
      },
    ],
  },
]

interface ModuleBase {
  id: string;
  label: string;
  description: string;
}

interface ModuleData extends ModuleBase {
  subsection: ModuleSubsectionData[]
}

interface ModuleSubsectionData extends ModuleBase {
  items: ModuleSubsectionItemData[]
}

interface ModuleSubsectionItemData extends ModuleBase {
  isSubmission: boolean;
  isRead?: boolean;
  submissionStatus?: SubmissionStatus;
  assignmentType?: AssignmentType;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'readings':
            return <IconBook size={20} />;
        case 'assignment':
            return <IconPencil size={20} />;
        case 'draft':
            return <IconEdit size={20} />;
        case 'milestone':
            return <IconFlag size={20} />;
        case 'survey':
            return <IconWriting size={20} />;
        default:
            return null;
    }
}

interface AccordionLabelProps {
  label: string;
  description: string;
  completedItemsCount?: number;
  totalItemsCount?: number;
  isItem?: boolean;
  isSubmission?: boolean;
  isRead?: boolean;
  assignmentType?: AssignmentType;
  submissionStatus?: SubmissionStatus;
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
                          submissionStatus
}: AccordionLabelProps) {
    const { authUser } = useAuth('protected');

    const handleDelete = () => {

    }

    return (
      <Group
        justify="space-between"
        align="center"
        h={'100%'}
        mt={isItem ? 'xs' : 'none'}
      >
        <Group wrap="nowrap">
          {isItem && getStatusIcon(submissionStatus!)}
          {getIcon(assignmentType!)}
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
  allExpanded: boolean;
}

const ModuleCard = ({ allExpanded }: ModuleCardProps) => {
  const theme = useMantineTheme()
  const [value, setValue] = useState<string[]>([])

  // Update expanded state when allExpanded prop changes
  useEffect(() => {
    if (allExpanded) {
      const allModuleIds = moduleData.map((module) => module.id)
      const allSubsectionLabels = moduleData.flatMap((module) =>
        module.subsection.map((sub) => sub.label),
      )
      setValue([...allModuleIds, ...allSubsectionLabels])
    } else {
      setValue([])
    }
  }, [allExpanded])

    const getCompletedItemsCount = (items: ModuleSubsectionItemData[]) => {
      return items.filter((item) => item.submissionStatus === 'ready-for-grading' || item.submissionStatus === 'graded').length
    }

  const items = moduleData.map((item) => (
    <Accordion.Item value={item.id} key={item.label}>
      <Accordion.Control aria-label={item.label}>
        <AccordionLabel
          label={item.label}
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
            <Accordion.Item value={subsection.label} key={subsection.label}>
              <Accordion.Control aria-label={subsection.label}>
                <AccordionLabel
                  label={subsection.label}
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
                    label={item.label}
                    description={item.description}
                    isItem={true}
                    isSubmission={item.isSubmission}
                    assignmentType={item.assignmentType}
                    submissionStatus={item.submissionStatus}
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

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return <IconCircleCheck size={18} color="green" />;
        case 'pending':
            {

              return <IconCircle size={18} color="gray" />
            }
        default:
            return <IconCircle size={18} color="gray" />;
    }
}

export default CourseModules