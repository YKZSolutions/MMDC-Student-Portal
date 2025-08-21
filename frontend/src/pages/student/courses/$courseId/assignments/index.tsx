import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconClock, IconHistory, IconSend } from '@tabler/icons-react'
import SearchComponent from '@/components/search-component.tsx'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import SubmissionButton from '@/components/submission-button.tsx'

interface AssignmentData {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime: string
  status: 'completed' | 'pending' | 'late' | 'locked'
}
const mockAssignmentsData: AssignmentData[] = [
  { id: '1', title: 'Project 1', description: 'Submit project report', dueDate: '2022-12-31', dueTime: '23:59', status: 'pending' },
  { id: '2', title: 'Assignment 2', description: 'Submit assignment', dueDate: '2023-01-15', dueTime: '11:59', status: 'late' },
  { id: '3', title: 'Project 2', description: 'Submit project report', dueDate: '2022-10-31', dueTime: '23:59', status: 'completed' },
  { id: '4', title: 'Assignment 1', description: 'Submit assignment', dueDate: '2022-11-15', dueTime: '11:59', status: 'completed' },
]
const AssignmentsPageStudentView = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo')

  const todoAssignments = mockAssignmentsData.filter((assignment) => assignment.status !== 'completed')
  const completedAssignments = mockAssignmentsData.filter((assignment) => assignment.status === 'completed')
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentData[]>(todoAssignments)

  const getAssignments = () => {
    return activeTab === "todo" ? todoAssignments : completedAssignments
  }

  const handleTabChange = (value: string | null) => {
    if (value === "todo" || value === "completed") {
      setActiveTab(value);
      setFilteredAssignments(value === "todo" ? todoAssignments : completedAssignments);
    }
  };

  return (
    <Stack>
      <Group justify="space-between" align="start">
        <Title>Assignments</Title>
      </Group>
      <Stack>
        <Tabs
          value={activeTab} onChange={handleTabChange}
        >
          <Tabs.List>
            <Tabs.Tab value="todo" leftSection={<IconSend size={12} />}>
              Todo
            </Tabs.Tab>
            <Tabs.Tab value="completed" leftSection={<IconHistory size={12} />}>
              Completed
            </Tabs.Tab>
          </Tabs.List>

          <Stack gap={'md'} p={'md'}>
            <SearchComponent data={getAssignments()} setData={setFilteredAssignments} identifier={'title'} placeholder={'Search for assignments'} />

            <Tabs.Panel value="todo">
              <AssignmentsPanel assignments={filteredAssignments} />
            </Tabs.Panel>

            <Tabs.Panel value="completed">
              <AssignmentsPanel assignments={filteredAssignments} />
            </Tabs.Panel>
          </Stack>
        </Tabs>
      </Stack>
    </Stack>
  )
}

const AssignmentsPanel = ({assignments}: {assignments: AssignmentData[]})=>{
  return (
    <Stack gap={'md'}>
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

const AssignmentCard = ({ assignment }: { assignment: AssignmentData }) => {
  const theme = useMantineTheme();
  const dueDate = dayjs(assignment.dueDate).format('MMM D')
  const dueTime = dayjs(assignment.dueDate).format('h:mm A')

  return (
    <Card withBorder radius="md" p="lg" shadow="xs">
      <Group justify="space-between" align="stretch">
        {/* Left Section: Title, Description, and Status */}
        <Stack flex={1} justify="space-between" gap="xs">
          <Group>
            <Title order={4} fw={600}>{assignment.title}</Title>
            <Badge color={assignment.status} variant="light" size="sm" tt="capitalize">
              {assignment.status.replace('-', ' ')}
            </Badge>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconClock size={16} color={theme.colors.gray[6]} />
            <Text size="sm" c="dimmed">
              Due: {dueDate} at {dueTime}
            </Text>
          </Group>
        </Stack>

        {/* Right Section: Action Button */}
        <Stack align="flex-end" justify="center" flex={1}>
          <SubmissionButton status={assignment.status} onClick={() => {}} />
        </Stack>
      </Group>
    </Card>
  );
}

export default AssignmentsPageStudentView
