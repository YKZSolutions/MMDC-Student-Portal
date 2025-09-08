import { Group, Stack, Tabs, Title } from '@mantine/core'
import { IconBook, IconCheck, IconHistory, IconSend } from '@tabler/icons-react'
import SearchComponent from '@/components/search-component.tsx'
import React, { useState } from 'react'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type { Role } from '@/integrations/api/client'
import type {
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import { mockAssignmentsData } from '@/features/courses/mocks.ts'
import AssignmentCard from '@/features/courses/assignments/assignment-card.tsx'

type RoleBasedAssignmentConfig = {
  [K in Role]: {
    tabs: {
      value: string
      label: string
      icon: React.ReactNode
    }[]
    filterFn: (a: StudentAssignment | AssignmentSubmissionReport) => boolean
  }
}

// TODO: Add more for other roles
const roleConfig: RoleBasedAssignmentConfig = {
  student: {
    tabs: [
      { value: 'todo', label: 'Todo', icon: <IconSend size={12} /> },
      {
        value: 'completed',
        label: 'Completed',
        icon: <IconHistory size={12} />,
      },
    ],
    filterFn: (a: StudentAssignment | AssignmentSubmissionReport) => {
      return 'submissionStatus' in a ? a.submissionStatus === 'pending' : false
    },
  },
  admin: {
    tabs: [
      { value: 'submitted', label: 'Submitted', icon: <IconBook size={12} /> },
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
    ],
    filterFn: (a: StudentAssignment | AssignmentSubmissionReport) => {
      return 'submissions' in a
        ? a.submissions.some((s) => s.submissionStatus === 'submitted')
        : false
    },
  },
  mentor: {
    tabs: [
      { value: 'submitted', label: 'Submitted', icon: <IconBook size={12} /> },
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
    ],
    filterFn: (a: StudentAssignment | AssignmentSubmissionReport) => {
      return 'submissions' in a
        ? a.submissions.some((s) => s.submissionStatus === 'submitted')
        : false
    },
  },
}

const CourseAssignments = () => {
  const { authUser } = useAuth('protected')

  const [activeTab, setActiveTab] = useState(
    roleConfig[authUser.role].tabs[0].value,
  )

  const todoAssignments = mockAssignmentsData.filter(
    (assignment) => assignment.submissionStatus === 'pending',
  )
  const completedAssignments = mockAssignmentsData.filter(
    (assignment) => assignment.submissionStatus === 'graded',
  )

  const getAssignments = () => {
    return activeTab === 'todo' ? todoAssignments : completedAssignments
  }

  const [filteredAssignments, setFilteredAssignments] =
    useState<StudentAssignment[]>(getAssignments)

  const handleTabChange = (value: string | null) => {
    if (value === 'todo' || value === 'completed') {
      setActiveTab(value)
      setFilteredAssignments(
        value === 'todo' ? todoAssignments : completedAssignments,
      )
    }
  }

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title>Assignments</Title>
      </Group>
      <Stack>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            {roleConfig[authUser.role].tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={tab.icon}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Stack gap={'md'} p={'md'}>
            <SearchComponent
              data={getAssignments()}
              onFilter={setFilteredAssignments}
              identifiers={['title']}
              placeholder={'Search for assignments'}
            />

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

const AssignmentPanel = ({
  assignments,
}: {
  assignments: StudentAssignment[]
}) => {
  return (
    <Stack gap={'md'}>
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

export default CourseAssignments
