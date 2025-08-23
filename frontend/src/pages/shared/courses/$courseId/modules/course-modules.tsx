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
  IconPencil,
  IconSettings,
  IconTrash,
  IconUrgent,
  IconWriting,
} from '@tabler/icons-react'
import { useState, useEffect } from "react";
import SubmissionButton from '@/components/submission-button.tsx'
import RoleComponentManager from "@/components/role-component-manager.tsx";
import {useAuth} from "@/features/auth/auth.hook.ts";

const CourseModules = () => {
  const [allExpanded, setAllExpanded] = useState(false);
  
  const toggleExpandAll = () => {
    setAllExpanded(prev => !prev);
  };

  return (
    <Stack>
      <Group justify="space-between" align="start">
        <Title>Course Name | Course Modules</Title>
        <Button onClick={toggleExpandAll}>
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
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
    type: 'default',
    subsection: [
      {
        label: 'Readings',
        description: 'Description of Readings',
        type: 'readings',
        items: [
          {
            label: 'Readings 1',
            description: 'Description of Readings 1',
            type: "readings",
            status: 'completed'
          }
        ]
      },
      {
        label: 'Output',
        description: 'Description of Output',
        type: 'submission',
        items: [
          {
            label: 'Assignment 1',
            description: 'Description of Assignment 1',
            type: "assignment",
            status: 'pending'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    label: 'Module 2',
    description: 'Description of Module 2',
    type: 'default',
    subsection: [
      {
        label: 'Output',
        description: 'Description of Output',
        type: 'submission',
        items: [
          {
            label: 'Draft',
            description: 'Description of Draft',
            type: 'draft',
            status: 'late'
          },
          {
            label: 'Milestone',
            description: 'Description of Milestone',
            type: 'milestone',
            status: 'locked'
          }
        ]
      },
    ]
  },
  {
    id: '3',
    label: 'Module 3',
    description: 'Description of Module 3',
    type: 'default',
    subsection: [
      {
        label: 'Readings',
        description: 'Description of Readings',
        type: 'readings',
        items: [
          {
            label: 'Readings 1',
            description: 'Description of Readings 1',
            type: 'readings',
            status: 'completed'
          }
        ]
      },
      {
        label: 'Output',
        description: 'Description of Output',
        type: 'submission',
        items: [
          {
            label: 'Draft',
            description: 'Description of Draft',
            type: 'draft',
            status: 'pending'
          },
        ]
      }
    ]
  },
  {
    id: '4',
    label: 'Module 4',
    description: 'Description of Module 4',
    type: 'default',
    subsection: [
        {
            label: 'Output',
            description: 'Description of Output',
            type: 'submission',
            items: [
                {
                    label: 'Draft Revision',
                    description: 'Description of Draft',
                    type: 'draft',
                    status: 'late'
                },
                {
                    label: 'Milestone',
                    description: 'Description of Milestone',
                    type: 'milestone',
                    status: 'locked'
                },
                {
                    label: 'Survey',
                    description: 'Description of Survey',
                    type: 'survey',
                    status: 'pending'
                }
            ]
        },
    ]
  },
]

interface ModuleData {
  id: string;
  label: string;
  description: string;
  type: 'default';
  subsection: ModuleSubsectionData[]
}

interface ModuleSubsectionData {
  label: string;
  description: string;
  type: 'readings' | 'submission';
  items: ModuleSubsectionItemData[]
}

interface ModuleSubsectionItemData {
  label: string;
  description: string;
  type: 'readings' | 'assignment' | 'draft' | 'milestone' | 'survey';
  status?: 'completed' | 'pending' | 'late' | 'locked';
}

interface AccordionLabelProps {
    label: string;
    description: string;
    type: 'module' | 'submission' | 'readings' | 'assignment' | 'draft' | 'milestone' | 'survey';
    completedItemsCount?: number;
    totalItemsCount?: number;
    isItem?: boolean;
    status?: 'completed' | 'pending' | 'late' | 'locked';
}

const getIcon = (type: string) => {
    switch (type) {
        case 'readings':
            return <IconBook size={20} />;
        case 'submission':
            return <IconFile size={20} />
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

function AccordionLabel({ label, description, type = 'module', completedItemsCount, totalItemsCount, isItem, status}: AccordionLabelProps) {
    const { authUser } = useAuth('protected');

    const handleDelete = () => {

    }

    return (
        <Group justify="space-between" align="center" h={'100%'} mt={isItem ? 'xs' : 'none'}>
            <Group wrap="nowrap">
                {isItem && (getStatusIcon(status!))}
                {getIcon(type)}
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
                            {
                                isItem ? type !== 'readings' && (
                                        <SubmissionButton status={status!} onClick={() => {}} />
                                    ) : totalItemsCount && (
                                    <Text>
                                        Completed: <strong>{completedItemsCount}</strong> out of <strong>{totalItemsCount}</strong>
                                    </Text>
                                )
                            }
                        </>
                    ),
                    admin: (
                        <>
                            <Group>
                                <ActionIcon variant="subtle" radius="lg" >
                                    <IconEdit size={'70%'}/>
                                </ActionIcon>
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <ActionIcon variant="default" radius="lg">
                                            <IconDotsVertical size={'70%'}/>
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
                                            Delete {type}
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </>
                    )
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
      return items.filter((item) => item.status === 'completed').length
    }

  const items = moduleData.map((item) => (
    <Accordion.Item value={item.id} key={item.label}>
      <Accordion.Control aria-label={item.label}>
        <AccordionLabel
          label={item.label}
          description={item.description}
          type={'module'}
          completedItemsCount={getCompletedItemsCount(item.subsection.flatMap((sub) => sub.items))}
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
                  type={subsection.type}
                  completedItemsCount={getCompletedItemsCount(subsection.items)}
                  totalItemsCount={subsection.items.length}
                />
              </Accordion.Control>
                {subsection.items.map((item) => (
                    <Accordion.Panel
                        style={{ borderTop: `1px solid ${theme.colors.gray[3]}`}}
                        m={0}
                        p={0}
                    >
                        <AccordionLabel
                            label={item.label}
                            description={item.description}
                            type={item.type}
                            isItem={true}
                            status={item.status}
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
            return <IconCircle size={18} color="gray" />;
        case 'late':
            return <IconUrgent size={18} color="red" />;
        case 'locked':
            return <IconLock size={18} color="gray" />;
        default:
            return <IconCircle size={18} color="gray" />;
    }
}

export default CourseModules