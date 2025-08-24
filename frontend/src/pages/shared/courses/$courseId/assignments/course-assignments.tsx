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
import {
  IconBook,
  IconCheck,
  IconClock,
  IconHistory,
  IconSend,
} from '@tabler/icons-react'
import SearchComponent from '@/components/search-component.tsx'
import React, { useState } from 'react'
import SubmissionButton from '@/components/submission-button.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import AssignmentPanel from '@/features/courses/assignments/assignment-panel.tsx'
import type { AssignmentData } from '@/features/courses/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type { Role } from '@/integrations/api/client'

const mockAssignmentsData: AssignmentData[] = [
  {
    id: '1',
    title: 'Project 1',
    description: 'Submit project report',
    dueTimestamp: '2022-12-31T23:59',
    submissionStatus: 'pending',
  },
  {
    id: '2',
    title: 'Assignment 2',
    description: 'Submit assignment',
    dueTimestamp: '2023-01-15T11:59',
    submissionStatus: 'late',
  },
  {
    id: '3',
    title: 'Project 2',
    description: 'Submit project report',
    dueTimestamp: '2022-10-31T23:59',
    submissionStatus: 'completed',
    submissionTimestamp: '2022-10-20T12:30',
  },
  {
    id: '4',
    title: 'Assignment 1',
    description: 'Submit assignment',
    dueTimestamp: '2022-11-15T11:59',
    submissionStatus: 'completed',
    submissionTimestamp: '2022-11-10T09:30',
  },
]

type RoleBasedAssignmentConfig = {
  [K in Role]?: {
    tabs: {
      value: string
      label: string
      icon: React.ReactNode
    }[]
    filterFn: (a: AssignmentData) => boolean
  }
}

// TODO: Add more for other roles
const roleConfig: RoleBasedAssignmentConfig = {
  student: {
    tabs: [
      { value: "todo", label: "Todo", icon: <IconSend size={12}/> },
      { value: "completed", label: "Completed", icon: <IconHistory size={12}/> }
    ],
    filterFn: (a: AssignmentData) => a.submissionStatus !== "completed"
  },
  admin: {
    tabs: [
      { value: "assigned", label: "Assigned", icon: <IconBook size={12}/> },
      { value: "graded", label: "Graded", icon: <IconCheck size={12}/> }
    ],
    filterFn: (a: AssignmentData) => a.submissionStatus === "assigned"
  }
};

const CourseAssignments = () => {
  const { authUser } = useAuth('protected')

  const [activeTab, setActiveTab] = useState(roleConfig[authUser.role]?.tabs[0].value);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentData[]>([]);

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
            <SearchComponent data={getAssignments()} onFilter={setFilteredAssignments} identifiers={['title']} placeholder={'Search for assignments'} />

            <Tabs.Panel value="todo">
              <AssignmentPanel assignments={filteredAssignments} />
            </Tabs.Panel>

            <Tabs.Panel value="completed">
              <AssignmentPanel assignments={filteredAssignments} />
            </Tabs.Panel>
          </Stack>
        </Tabs>
      </Stack>
    </Stack>
  )
}

export default CourseAssignments
