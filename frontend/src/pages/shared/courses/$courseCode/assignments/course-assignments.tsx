import { Group, Stack, Tabs, Title } from '@mantine/core'
import { IconBook, IconCheck, IconHistory, IconSend } from '@tabler/icons-react'
import SearchComponent from '@/components/search-component.tsx'
import React, { useState } from 'react'
import AssignmentPanel from '@/features/courses/assignments/assignment-panel.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type { Role } from '@/integrations/api/client'
import type {
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import { getFutureDate, getPastDate } from '@/utils/helpers.ts'

export const mockAssignmentsData: StudentAssignment[] = [
  {
    id: '1',
    title: 'Pending',
    type: 'assignment',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'pending',
  },
  {
    id: '2',
    title: 'Draft',
    type: 'draft',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'draft',
  },
  {
    id: '3',
    title: 'Submitted',
    type: 'other',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'submitted',
    submissionTimestamp: getPastDate(1),
  },
  {
    id: '4',
    title: 'Ready for Grading',
    type: 'milestone',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'ready-for-grading',
    submissionTimestamp: getPastDate(1),
  },
  {
    id: '5',
    title: 'Graded Individual Project',
    type: 'milestone',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'graded',
    submissionTimestamp: getPastDate(1),
    grade: {
      id: '1',
      assignmentId: '5',
      studentId: 'stud1',
      score: 90,
      maxScore: 100,
      feedback: 'Great job!',
      gradedBy: 'teacher1',
      gradedAt: getPastDate(1),
    },
  },
  {
    id: '6',
    title: 'Graded Group Project',
    type: 'milestone',
    dueDate: getFutureDate(2),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'graded',
    submissionTimestamp: getPastDate(1),
    grade: {
      id: '1',
      assignmentId: '6',
      groupId: 'grp1',
      groupMemberIds: ['stud1', 'stud2', 'stud3'],
      score: 90,
      maxScore: 100,
      feedback: 'Great job!',
      gradedBy: 'teacher1',
      gradedAt: getPastDate(1),
    },
  },
  {
    id: '7',
    title: 'Late',
    type: 'assignment',
    dueDate: getPastDate(1),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'pending',
  },
  {
    id: '8',
    title: 'Missed',
    type: 'assignment',
    dueDate: getPastDate(1),
    mode: 'individual',
    status: 'closed',
    submissionStatus: 'pending',
  },
]

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

export default CourseAssignments
