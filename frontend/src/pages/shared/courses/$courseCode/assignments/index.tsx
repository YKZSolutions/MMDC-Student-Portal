import SubmitButton from '@/components/submit-button.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import {
  mockAssignmentSubmissionReports,
  mockStudentAssignments,
} from '@/features/courses/mocks.ts'
import type { Role } from '@/integrations/api/client'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
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
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core'
import {
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconEye,
  IconHistory,
  IconSearch,
  IconSend,
} from '@tabler/icons-react'
import React, { type ReactNode, useEffect, useState } from 'react'

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

function AssignmentPage() {
  const { authUser } = useAuth('protected')
  const [activeTab, setActiveTab] = useState(
    roleConfig[authUser.role].tabs[0].value,
  )

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title size={'h2'}>Assignments</Title>
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

          <Stack gap="md" py={'md'}>
            {/* Role-specific Panels */}
            <AssignmentPanelsFactory activeTab={activeTab} />
          </Stack>
        </Tabs>
      </Stack>
    </Stack>
  )
}

function AssignmentPanelsFactory({ activeTab }: { activeTab: string }) {
  const { authUser } = useAuth('protected')

  switch (authUser.role) {
    case 'student':
      return <StudentAssignments activeTab={activeTab} />
    case 'mentor':
      return <MentorAssignments activeTab={activeTab} />
    case 'admin':
      return <AdminAssignments activeTab={activeTab} />
    default:
      return null
  }
}

// Student view - keep card layout (friendly, task-oriented)
function StudentAssignments({ activeTab }: { activeTab: string }) {
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
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />

      {filteredData?.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </Stack>
  )
}

// Mentor view - table-first for grading queue
function MentorAssignments({ activeTab }: { activeTab: string }) {
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
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />

      <Table
        highlightOnHover
        style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
        verticalSpacing={'lg'}
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
              borderBottom: '1px solid',
              borderColor: 'var(--mantine-color-gray-3)',
            }}
            bg={'gray.1'}
            c={'dark.5'}
          >
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Submissions</Table.Th>
            <Table.Th>Progress</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredData?.map((report) => {
            const counts = getSubmissionCounts(report)
            const isExpanded = expandedRows.has(report.id)

            return (
              <React.Fragment key={report.id}>
                <Table.Tr
                  onClick={() => toggleExpand(report.id)}
                  style={{ cursor: 'pointer' }}
                >
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
                      <Box>
                        <Text fw={500} c="dark.5">
                          {report.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {report.points} points • {report.type}
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" c={'dark.3'}>
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
                    <Text size="sm" fw={500} c={'dark.5'}>
                      {counts.graded}/{counts.total} completed
                    </Text>
                  </Table.Td>
                </Table.Tr>

                {/* Expanded submissions row */}
                <Table.Tr
                  style={{
                    border: isExpanded ? undefined : '0px',
                  }}
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
                            radius={'md'}
                          >
                            <Group justify="space-between">
                              <Stack gap={2}>
                                <Text fw={500} size="sm">
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
                                    <Text size="sm" c="dimmed">
                                      {formatTimestampToDateTimeText(
                                        submission.submittedAt,
                                      )}
                                    </Text>
                                  )}
                                </Group>
                              </Stack>
                              <Group gap={rem(10)}>
                                <Text size="xs" fw={500}>
                                  {submission.grade
                                    ? `${submission.grade}/${report.points}`
                                    : 'Not graded'}
                                </Text>
                                <Button
                                  size="xs"
                                  variant="light"
                                  leftSection={<IconEye size={14} />}
                                  radius={'md'}
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
function AdminAssignments({ activeTab }: { activeTab: string }) {
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
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />
      <Table.ScrollContainer minWidth={rem(800)}>
        <Table
          highlightOnHover
          style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
          styles={{
            th: {
              fontWeight: 500,
            },
          }}
          verticalSpacing={'lg'}
        >
          <Table.Thead>
            <Table.Tr
              style={{
                border: '0px',
                borderBottom: '1px solid',
                borderColor: 'var(--mantine-color-gray-3)',
              }}
              bg={'gray.1'}
              c={'dark.5'}
            >
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
                    <Box>
                      <Text fw={500} c={'dark.5'}>
                        {report.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {report.points} points • {report.type}
                      </Text>
                    </Box>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" c={'dark.3'}>
                      {formatTimestampToDateTimeText(report.dueDate, 'by')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="outline"
                      size="sm"
                      color={report.status === 'open' ? 'green' : 'red'}
                    >
                      {report.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" c={'dimmed'}>
                      <Badge color="blue" variant="light" size="sm">
                        {stats.pending} submitted
                      </Badge>
                      <Badge color="green" variant="light" size="sm">
                        {stats.graded} graded
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} c="dark.5">
                      {stats.completionRate || 0}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      {stats.graded}/{stats.total} completed
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="dot" size="xs">
                        {report.mode === 'group' ? 'Group' : 'Individual'}
                      </Badge>
                      {report.allowResubmission && (
                        <Badge color="orange" variant="dot" size="xs">
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
      </Table.ScrollContainer>
    </Stack>
  )
}

function AssignmentCard({ assignment }: { assignment: StudentAssignment }) {
  const theme = useMantineTheme()

  return (
    <Card withBorder radius="md" p={'lg'}>
      <Group justify="space-between" align="center">
        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
          <Avatar radius="md" color="blue">
            <IconBook size={18} />
          </Avatar>

          <Stack gap={rem(5)}>
            <Group align="center">
              <Title order={5} fw={600}>
                {assignment.title}
              </Title>
              <Badge
                color={assignment.submissionStatus}
                variant="outline"
                size="sm"
              >
                {assignment.submissionStatus}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2} tt={'capitalize'}>
              {assignment.type} • {assignment.points} points
            </Text>

            <Group gap="sm">
              {assignment.submittedAt ? (
                <Text size="sm" fw={600} c="dimmed">
                  Submitted:{' '}
                  {formatTimestampToDateTimeText(assignment.submittedAt)}
                </Text>
              ) : (
                <Text size="sm" fw={600} c="dimmed">
                  Due: {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>

        <SubmitButton
          submissionStatus={assignment.submissionStatus}
          onClick={() => {}}
          dueDate={assignment.dueDate}
          assignmentStatus={assignment.status}
        />
      </Group>
    </Card>
  )
}

export default AssignmentPage
