import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Modal,
  rem,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import {
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconEye,
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
      { value: 'all', label: 'All Assignments', icon: <IconBook size={12} /> },
      {
        value: 'needs-attention',
        label: 'Needs Attention',
        icon: <IconCheck size={12} />,
      },
    ],
  },
  mentor: {
    tabs: [
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
      {
        value: 'all',
        label: 'All Assignments',
        icon: <IconHistory size={12} />,
      },
    ],
  },
}

const AssignmentPage = () => {
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

// Student view - keep card layout (friendly, task-oriented)
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
        placeholder={'Search assignments...'}
        onFilter={setFilteredData}
      />
      {filteredData?.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

// Mentor view - table-first for grading queue
const MentorAssignments = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<AssignmentSubmissionReport[]>(
    mockAssignmentSubmissionReports,
  )
  const [filteredData, setFilteredData] =
    useState<AssignmentSubmissionReport[]>()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [submissionModalData, setSubmissionModalData] = useState<{
    assignment: AssignmentSubmissionReport
    submission: any
  } | null>(null)

  useEffect(() => {
    let filtered = data
    if (activeTab === 'to-grade') {
      filtered = data.filter((report) =>
        report.submissions.some((s) => s.submissionStatus === 'submitted'),
      )
    } else if (activeTab === 'graded') {
      filtered = data.filter((report) =>
        report.submissions.some((s) => s.submissionStatus === 'graded'),
      )
    }
    setFilteredData(filtered)
  }, [activeTab, data])

  const toggleExpand = (assignmentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId)
    } else {
      newExpanded.add(assignmentId)
    }
    setExpandedRows(newExpanded)
  }

  const getSubmissionCounts = (report: AssignmentSubmissionReport) => {
    const submitted = report.submissions.filter(
      (s) => s.submissionStatus === 'submitted',
    ).length
    const graded = report.submissions.filter(
      (s) => s.submissionStatus === 'graded',
    ).length
    const pending = report.submissions.filter(
      (s) => s.submissionStatus === 'pending',
    ).length

    return { submitted, graded, pending, total: report.submissions.length }
  }

  return (
    <Stack>
      <SearchComponent
        data={data}
        identifiers={['title']}
        placeholder={'Search assignments...'}
        onFilter={setFilteredData}
      />

      <Table highlightOnHover style={{ borderRadius: rem('8px') }}>
        <Table.Thead>
          <Table.Tr bg={'gray.1'} c={'dark.5'}>
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Submissions</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredData?.map((report) => {
            const counts = getSubmissionCounts(report)
            const isExpanded = expandedRows.has(report.id)

            return (
              <React.Fragment key={report.id}>
                <Table.Tr>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="transparent"
                        size="sm"
                        onClick={() => toggleExpand(report.id)}
                      >
                        {isExpanded ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                      <div>
                        <Text fw={500}>{report.title}</Text>
                        <Text size="sm" c="dimmed">
                          {report.points} points • {report.type}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text>
                      {formatTimestampToDateTimeText(report.dueDate, 'by')}
                    </Text>
                    <Badge
                      color={report.status === 'open' ? 'green' : 'red'}
                      variant="outline"
                      size="xs"
                    >
                      {report.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="light" size="sm">
                        {counts.submitted} submitted
                      </Badge>
                      <Badge color="green" variant="light" size="sm">
                        {counts.graded} graded
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {counts.graded}/{counts.total} completed
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => toggleExpand(report.id)}
                    >
                      {isExpanded ? 'Hide' : 'View'} Submissions
                    </Button>
                  </Table.Td>
                </Table.Tr>

                {/* Expanded submissions row */}
                <Table.Tr
                  style={{ display: isExpanded ? 'table-row' : 'none' }}
                >
                  <Table.Td colSpan={5} p={0}>
                    <Collapse in={isExpanded}>
                      <Stack gap="xs" p="md" bg="gray.0">
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
                                <Group gap="xs">
                                  <Badge
                                    color={submission.submissionStatus}
                                    variant="filled"
                                    size="xs"
                                  >
                                    {submission.submissionStatus}
                                  </Badge>
                                  {submission.submittedAt && (
                                    <Text size="xs" c="dimmed">
                                      {formatTimestampToDateTimeText(
                                        submission.submittedAt,
                                      )}
                                    </Text>
                                  )}
                                </Group>
                              </Stack>
                              <Group gap="xs">
                                <Text size="sm" fw={500}>
                                  {submission.grade
                                    ? `${submission.grade}/${report.points}`
                                    : 'Not graded'}
                                </Text>
                                <Button
                                  size="xs"
                                  variant="light"
                                  leftSection={<IconEye size={14} />}
                                  onClick={() =>
                                    setSubmissionModalData({
                                      assignment: report,
                                      submission,
                                    })
                                  }
                                >
                                  View
                                </Button>
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
                    </Collapse>
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            )
          })}
        </Table.Tbody>
      </Table>

      {/* Submission Detail Modal */}
      <Modal
        opened={!!submissionModalData}
        onClose={() => setSubmissionModalData(null)}
        title="Submission Details"
        size="lg"
      >
        {submissionModalData && (
          <Stack>
            <Group justify="space-between">
              <Title order={4}>{submissionModalData.assignment.title}</Title>
              <Badge>{submissionModalData.assignment.type}</Badge>
            </Group>
            <Text>
              Student:{' '}
              {'studentName' in submissionModalData.submission
                ? submissionModalData.submission.studentName
                : `Group ${submissionModalData.submission.groupId}`}
            </Text>
            {/* Add more submission details here */}
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}

// Admin view - summary/oversight focused
const AdminAssignments = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<AssignmentSubmissionReport[]>(
    mockAssignmentSubmissionReports,
  )
  const [filteredData, setFilteredData] =
    useState<AssignmentSubmissionReport[]>(data)

  useEffect(() => {
    let filtered = data
    if (activeTab === 'needs-attention') {
      filtered = data.filter((report) => {
        const submittedCount = report.submissions.filter(
          (s) => s.submissionStatus === 'submitted',
        ).length
        const gradedCount = report.submissions.filter(
          (s) => s.submissionStatus === 'graded',
        ).length
        return submittedCount > gradedCount || report.status === 'closed'
      })
    }
    setFilteredData(filtered)
  }, [activeTab, data])

  const getAssignmentStats = (report: AssignmentSubmissionReport) => {
    const submittedCount = report.submissions.filter(
      (s) => s.submissionStatus === 'submitted',
    ).length
    const gradedCount = report.submissions.filter(
      (s) => s.submissionStatus === 'graded',
    ).length
    const pendingCount = report.submissions.filter(
      (s) => s.submissionStatus === 'pending',
    ).length

    return {
      submitted: submittedCount,
      graded: gradedCount,
      pending: pendingCount,
      total: report.submissions.length,
      completionRate: Math.round(
        (gradedCount / report.submissions.length) * 100,
      ),
    }
  }

  return (
    <Stack>
      <SearchComponent
        data={data}
        identifiers={['title']}
        placeholder={'Search assignments...'}
        onFilter={setFilteredData}
      />

      <Table highlightOnHover style={{ borderRadius: rem('8px') }}>
        <Table.Thead>
          <Table.Tr bg={'gray.1'} c={'dark.5'}>
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Completion Rate</Table.Th>
            <Table.Th>Configuration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredData?.map((report) => {
            const stats = getAssignmentStats(report)

            return (
              <Table.Tr key={report.id}>
                <Table.Td>
                  <div>
                    <Text fw={500}>{report.title}</Text>
                    <Text size="sm" c="dimmed">
                      {report.points} points • {report.type}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  {formatTimestampToDateTimeText(report.dueDate, 'by')}
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="outline"
                    color={report.status === 'open' ? 'green' : 'red'}
                  >
                    {report.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Text size="sm">Pending: {stats.pending}</Text>
                    <Text size="sm">Submitted: {stats.submitted}</Text>
                    <Text size="sm">Graded: {stats.graded}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Total: {stats.total}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{stats.completionRate}%</Text>
                  <Text size="xs" c="dimmed">
                    {stats.graded}/{stats.total} completed
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge color="blue" variant="light" size="xs">
                      {report.mode === 'group' ? 'Group' : 'Individual'}
                    </Badge>
                    {report.allowResubmission && (
                      <Badge color="orange" variant="light" size="xs">
                        Resubmission
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
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
                  Submitted:{' '}
                  {formatTimestampToDateTimeText(assignment.submittedAt)}
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

export default AssignmentPage
