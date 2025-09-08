import {
  Badge,
  Card,
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
import React, { type ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type { Role } from '@/integrations/api/client'
import type {
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import {
  mockAssignmentSubmissionReports,
  mockStudentAssignments,
} from '@/features/courses/mocks.ts'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SubmitButton from '@/components/submit-button.tsx'
import SearchComponent from '@/components/search-component.tsx'

type RoleBasedAssignmentConfig = {
  [K in Role]: {
    tabs: {
      value: string
      label: string
      icon: ReactNode
    }[]
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
  },
  admin: {
    tabs: [
      { value: 'submitted', label: 'Submitted', icon: <IconBook size={12} /> },
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
    ],
  },
  mentor: {
    tabs: [
      { value: 'submitted', label: 'Submitted', icon: <IconBook size={12} /> },
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
    ],
  },
}

const CourseAssignments = () => {
  const { authUser } = useAuth('protected')

  const [activeTab, setActiveTab] = useState(
    roleConfig[authUser.role].tabs[0].value,
  )

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title>Assignments</Title>
      </Group>
      <Stack>
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as any)}
        >
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

          <Stack gap="md" p="md">
            {/* Role-specific Panels */}
            {authUser.role === 'student' && (
              <StudentAssignments activeTab={activeTab} />
            )}
            {authUser.role === 'mentor' && (
              <MentorAssignments activeTab={activeTab} />
            )}
            {authUser.role === 'admin' && (
              <AdminAssignments activeTab={activeTab} />
            )}
          </Stack>
        </Tabs>
      </Stack>
    </Stack>
  )
}

const StudentAssignments = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<StudentAssignment[]>(mockStudentAssignments)
  const [filteredData, setFilteredData] = useState<StudentAssignment[]>()

  useEffect(() => {
    const assignments =
      activeTab === 'todo'
        ? data.filter((a) => a.submissionStatus === 'pending')
        : data.filter((a) => a.submissionStatus === 'graded')
    setFilteredData(assignments)
  }, [activeTab, data])

  return (
    <Stack>
      <SearchComponent
        data={filteredData || []}
        identifiers={['title']}
        placeholder={'Search'}
        onFilter={setFilteredData}
      />
      {filteredData?.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

const MentorAssignments = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<AssignmentSubmissionReport[]>(
    mockAssignmentSubmissionReports,
  )
  const [filteredData, setFilteredData] =
    useState<AssignmentSubmissionReport[]>()

  return (
    <Stack>
      <SearchComponent
        data={data}
        identifiers={['title']}
        placeholder={'Search'}
        onFilter={setFilteredData}
      />

      {filteredData?.map((report) => (
        <Card key={report.id} withBorder radius="md" p="lg">
          <Group justify="space-between" align="center" mb="sm">
            <Title order={4}>{report.title}</Title>
            <Badge>{report.type}</Badge>
          </Group>

          <Stack gap="sm">
            {report.submissions.map((submission) => (
              <Card
                key={
                  'studentId' in submission
                    ? submission.studentId
                    : submission.groupId
                }
                withBorder
                p="sm"
              >
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={500}>
                      {'studentName' in submission
                        ? submission.studentName
                        : `Group ${submission.groupId}`}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Status: {submission.submissionStatus}
                    </Text>
                  </Stack>

                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {submission.grade
                        ? `${submission.grade}/${report.points}`
                        : 'Not graded'}
                    </Text>
                    <SubmitButton
                      submissionStatus={submission.submissionStatus}
                      onClick={() => {}}
                      dueDate={report.dueDate}
                      assignmentStatus={report.status}
                    />
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}

const AdminAssignments = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<AssignmentSubmissionReport[]>(
    mockAssignmentSubmissionReports,
  )
  const [filteredData, setFilteredData] =
    useState<AssignmentSubmissionReport[]>(data)

  return (
    <Stack>
      <SearchComponent
        data={data}
        identifiers={['title']}
        placeholder={'Search'}
        onFilter={setFilteredData}
      />

      {filteredData?.map((report) => {
        const submittedCount = report.submissions.filter(
          (s) => s.submissionStatus === 'submitted',
        ).length
        const gradedCount = report.submissions.filter(
          (s) => s.submissionStatus === 'graded',
        ).length

        return (
          <Card key={report.id} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="sm">
              <Title order={4}>{report.title}</Title>
              <Badge
                variant="outline"
                color={report.status === 'open' ? 'green' : 'red'}
              >
                {report.status}
              </Badge>
            </Group>

            <Group gap="lg">
              <Text size="sm">Submissions: {submittedCount}</Text>
              <Text size="sm">Graded: {gradedCount}</Text>
              <Text size="sm">Total: {report.submissions.length}</Text>
            </Group>

            <Group justify="flex-end" mt="md">
              <Badge color="blue" variant="light">
                {report.mode === 'group' ? 'Group Mode' : 'Individual'}
              </Badge>
              {report.allowResubmission && (
                <Badge color="orange" variant="light">
                  Resubmission Allowed
                </Badge>
              )}
            </Group>
          </Card>
        )
      })}
    </Stack>
  )
}

const AssignmentCard = ({ assignment }: { assignment: StudentAssignment }) => {
  const theme = useMantineTheme()

  return (
    <Card withBorder radius="md" p="lg" shadow="xs">
      <Group justify="space-between" align="stretch">
        {/* Left Section: Title, Description, and Status */}
        <Stack flex={1} justify="space-between" gap="xs">
          <Group>
            <Title order={4} fw={600}>
              {assignment.title}
            </Title>
            <Badge
              color={assignment.submissionStatus}
              variant="outline"
              size="md"
            >
              {assignment.submissionStatus}
            </Badge>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconClock size={16} color={theme.colors.gray[6]} />
            <Text size="sm" c="dimmed">
              Due: {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
            </Text>
            {assignment.submittedAt && (
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  |
                </Text>
                <Text size="sm" c="dimmed">
                  Submitted: {formatTimestampToDateTimeText(assignment.dueDate)}
                </Text>
              </Group>
            )}
          </Group>
        </Stack>

        {/* Right Section: Action Button */}
        <Stack align="flex-end" justify="center" flex={1}>
          <SubmitButton
            submissionStatus={assignment.submissionStatus}
            onClick={() => {}}
            dueDate={assignment.dueDate}
            assignmentStatus={assignment.status}
          />
        </Stack>
      </Group>
    </Card>
  )
}

export default CourseAssignments
