import SearchComponent from '@/components/search-component.tsx'
import SuspendedTableRows from '@/components/suspended-table-rows'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  CourseGradebookForMentor,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import {
  mockMentorGradebook,
  mockStudentGradebook,
} from '@/features/courses/mocks.ts'
import { formatTimestampToDateTimeText } from '@/utils/formatters'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Group,
  Progress,
  rem,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import {
  IconChevronDown,
  IconChevronRight,
  IconMinus,
  IconNote,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Suspense, useEffect, useState } from 'react'

function CourseGrades() {
  const { authUser } = useAuth('protected')
  const [studentFiltered, setStudentFiltered] = useState<
    StudentAssignmentGrade[]
  >([])
  const [mentorFiltered, setMentorFiltered] = useState<
    CourseGradebookForMentor['assignments']
  >([])
  const [adminFiltered, setAdminFiltered] = useState<
    CourseGradebookForMentor['assignments']
  >([])
  const [viewMode, setViewMode] = useState<'by-assignment' | 'by-student'>(
    'by-assignment',
  )

  // Get role-specific data and filtering
  const getRoleSpecificContent = () => {
    switch (authUser.role) {
      case 'student':
        return {
          data: mockStudentGradebook.assignments,
          filtered: studentFiltered,
          onFilter: setStudentFiltered,
          identifiers: ['assignmentTitle'] as const,
        }
      case 'mentor':
        return {
          data: mockMentorGradebook.assignments,
          filtered: mentorFiltered,
          onFilter: setMentorFiltered,
          identifiers: [
            'assignmentTitle',
            ['submissions', 'studentName'],
          ] as const,
        }
      case 'admin':
        return {
          data: mockMentorGradebook.assignments, // Admins see same data as mentors but different view
          filtered: adminFiltered,
          onFilter: setAdminFiltered,
          identifiers: [
            'assignmentTitle',
            ['submissions', 'studentName'],
          ] as const,
        }
      default:
        throw new Error('Invalid role')
    }
  }

  const { data, filtered, onFilter, identifiers } = getRoleSpecificContent()

  useEffect(() => {
    if (filtered.length === 0 && data.length > 0) {
      onFilter(data as any)
    }
  }, [data])

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title size={'h2'}>Grades</Title>
        <Group align="start">
          <SearchComponent
            data={data as any}
            onFilter={onFilter as any}
            identifiers={identifiers as any}
            placeholder="Search..."
          />

          {/* View mode tabs for mentor/admin */}
          {(authUser.role === 'mentor' || authUser.role === 'admin') && (
            <Tabs
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
              variant="pills"
            >
              <Tabs.List>
                <Tabs.Tab value="by-assignment">By Assignment</Tabs.Tab>
                <Tabs.Tab value="by-student">By Student</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          )}
        </Group>
      </Group>

      {/* Role-specific table views */}
      {authUser.role === 'student' && (
        <StudentGradesTable assignments={studentFiltered} />
      )}

      {authUser.role === 'mentor' && (
        <MentorGradesTable assignments={mentorFiltered} viewMode={viewMode} />
      )}

      {authUser.role === 'admin' && (
        <AdminGradesTable assignments={adminFiltered} viewMode={viewMode} />
      )}
    </Stack>
  )
}

function StudentGradesTable({
  assignments,
}: {
  assignments: StudentAssignmentGrade[]
}) {
  const theme = useMantineTheme()

  return (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
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
              <Table.Th>Due</Table.Th>
              <Table.Th>Submitted At</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Grade</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Suspense fallback={<SuspendedTableRows columns={6} />}>
              {assignments.map((assignment) => {
                // Get the latest submission
                const latestSubmission =
                  assignment.submissions.length > 0
                    ? assignment.submissions[assignment.submissions.length - 1]
                    : null

                // Determine if this is a group assignment
                const isGroupAssignment =
                  latestSubmission?.grade?.groupId !== undefined

                return (
                  <Table.Tr key={assignment.assignmentId}>
                    <Table.Td>
                      <Box>
                        <Text fw={500}>{assignment.assignmentTitle}</Text>
                        <Text size="sm" c="dimmed">
                          {assignment.points} points
                          {isGroupAssignment && ' (Group)'}
                        </Text>
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm" c={'dark.4'}>
                        {formatTimestampToDateTimeText(
                          assignment.dueDate,
                          'by',
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm" c={'dark.4'}>
                        {latestSubmission?.submittedAt
                          ? formatTimestampToDateTimeText(
                              latestSubmission.submittedAt,
                            )
                          : 'Not Submitted'}
                        {latestSubmission?.isLate && (
                          <Text size="xs" c="red.4" fw={500}>
                            {latestSubmission.lateDays} day(s) late
                          </Text>
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {assignment.currentGrade ? (
                        <Box>
                          <Text fw={500} c={'dark.4'}>
                            {assignment.currentGrade.score} /{' '}
                            {assignment.currentGrade.maxScore}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {assignment.currentGrade.gradedAt &&
                              `Graded ${formatTimestampToDateTimeText(assignment.currentGrade.gradedAt)}`}
                          </Text>
                        </Box>
                      ) : (
                        <Text c="dimmed">- / {assignment.points}</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {assignment.currentGrade?.feedback ? (
                        <Tooltip label={assignment.currentGrade.feedback}>
                          <IconNote size={20} color={theme.colors.dark[4]} />
                        </Tooltip>
                      ) : (
                        <IconNote size={20} color="gray" />
                      )}
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Suspense>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Box>
  )
}

function MentorGradesTable({
  assignments,
  viewMode = 'by-assignment',
}: {
  assignments: CourseGradebookForMentor['assignments']
  viewMode?: 'by-assignment' | 'by-student'
}) {
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(
    new Set(),
  )

  const toggleExpand = (assignmentId: string) => {
    const newExpanded = new Set(expandedAssignments)
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId)
    } else {
      newExpanded.add(assignmentId)
    }
    setExpandedAssignments(newExpanded)
  }

  const getAssignmentStats = (
    assignment: CourseGradebookForMentor['assignments'][number],
  ) => {
    const totalSubmissions = assignment.submissions.length
    const gradedSubmissions = assignment.submissions.filter(
      (s) => s.grade,
    ).length
    const averageScore =
      gradedSubmissions > 0
        ? assignment.submissions
            .filter((s) => s.grade)
            .reduce((sum, s) => sum + (s.grade?.score || 0), 0) /
          gradedSubmissions
        : 0

    return {
      totalSubmissions,
      gradedSubmissions,
      averageScore,
      completionRate: (gradedSubmissions / totalSubmissions) * 100,
    }
  }

  if (viewMode === 'by-student') {
    // Group by student view
    const studentMap = new Map()
    assignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        if (!studentMap.has(submission.studentId)) {
          studentMap.set(submission.studentId, {
            studentId: submission.studentId,
            studentName: submission.studentName,
            assignments: [],
          })
        }
        studentMap.get(submission.studentId).assignments.push({
          ...assignment,
          submission,
        })
      })
    })

    return (
      <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Card withBorder mb="md" p="md">
          <Title order={4} mb="sm">
            Class Overview
          </Title>
          <Group justify="space-evenly" px={'xl'}>
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Total Students
              </Text>
              <Text size="xl" fw={700}>
                {studentMap.size}
              </Text>
            </Stack>
            <Divider orientation="vertical" />
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Total Assignments
              </Text>
              <Text size="xl" fw={700}>
                {assignments.length}
              </Text>
            </Stack>
            <Divider orientation="vertical" />
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Class Average
              </Text>
              <Text size="xl" fw={700}>
                {(
                  Array.from(studentMap.values())
                    .filter((s: any) => s.gradedAssignments > 0)
                    .reduce(
                      (sum: number, s: any) =>
                        sum + (s.totalScore / s.totalPossible) * 100,
                      0,
                    ) /
                  Math.max(
                    1,
                    Array.from(studentMap.values()).filter(
                      (s: any) => s.gradedAssignments > 0,
                    ).length,
                  )
                ).toFixed(1)}
              </Text>
            </Stack>
          </Group>
        </Card>
        <Table
          highlightOnHover
          highlightOnHoverColor="gray.0"
          style={{ borderRadius: rem('8px'), minWidth: '1000px' }}
        >
          <Table.Thead>
            <Table.Tr bg={'gray.1'} c={'dark.5'}>
              <Table.Th>Student</Table.Th>
              <Table.Th>Assignment</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Grade</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Suspense fallback={<SuspendedTableRows columns={7} />}>
              {Array.from(studentMap.values()).flatMap((student: any) =>
                student.assignments.map((assignmentWithSubmission: any) => (
                  <Table.Tr
                    key={`${student.studentId}-${assignmentWithSubmission.assignmentId}`}
                  >
                    <Table.Td>
                      <Text fw={500}>{student.studentName}</Text>
                      <Text size="xs" c="dimmed">
                        ID: {student.studentId}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{assignmentWithSubmission.assignmentTitle}</Text>
                      <Text size="xs" c="dimmed">
                        {assignmentWithSubmission.points} points
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {formatTimestampToDateTimeText(
                        assignmentWithSubmission.dueDate,
                        'by',
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          assignmentWithSubmission.submission.submissionStatus
                        }
                        variant="filled"
                        size="sm"
                      >
                        {assignmentWithSubmission.submission.submissionStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {assignmentWithSubmission.submission.submissionTimestamp
                        ? formatTimestampToDateTimeText(
                            assignmentWithSubmission.submission
                              .submissionTimestamp,
                          )
                        : 'Not Submitted'}
                    </Table.Td>
                    <Table.Td>
                      {assignmentWithSubmission.submission.grade ? (
                        <div>
                          <Text fw={500}>
                            {assignmentWithSubmission.submission.grade.score} /{' '}
                            {assignmentWithSubmission.submission.grade.maxScore}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {assignmentWithSubmission.submission.grade
                              .gradedAt &&
                              `Graded ${formatTimestampToDateTimeText(assignmentWithSubmission.submission.grade.gradedAt)}`}
                          </Text>
                        </div>
                      ) : (
                        <Text c="dimmed">
                          - / {assignmentWithSubmission.points}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => {
                          console.log(
                            'Grade assignment:',
                            assignmentWithSubmission.assignmentId,
                            student.studentId,
                          )
                        }}
                      >
                        {assignmentWithSubmission.submission
                          .submissionStatus === 'graded'
                          ? 'Edit'
                          : 'Grade'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                )),
              )}
            </Suspense>
          </Table.Tbody>
        </Table>
      </Box>
    )
  }

  // Default: by-assignment view with collapsible grouping
  return (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <Table
        highlightOnHover
        highlightOnHoverColor="gray.0"
        style={{ borderRadius: rem('8px'), minWidth: '1000px' }}
      >
        <Table.Thead>
          <Table.Tr bg={'gray.1'} c={'dark.5'}>
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Average Score</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Suspense fallback={<SuspendedTableRows columns={5} />}>
            {assignments.map((assignment) => {
              const stats = getAssignmentStats(assignment)
              const isExpanded = expandedAssignments.has(
                assignment.assignmentId,
              )

              return (
                <>
                  <Table.Tr key={assignment.assignmentId}>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="transparent"
                          size="sm"
                          onClick={() => toggleExpand(assignment.assignmentId)}
                        >
                          {isExpanded ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                        <div>
                          <Text fw={500}>{assignment.assignmentTitle}</Text>
                          <Text size="sm" c="dimmed">
                            {assignment.points} points
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Progress
                          value={stats.completionRate}
                          size="sm"
                          color="green"
                        />
                        <Text size="sm">
                          {stats.gradedSubmissions}/{stats.totalSubmissions}{' '}
                          graded
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>
                        {stats.averageScore.toFixed(1)}/{assignment.points}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {(
                          (stats.averageScore / (assignment.points || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => toggleExpand(assignment.assignmentId)}
                      >
                        {isExpanded ? 'Hide' : 'View'} Students
                      </Button>
                    </Table.Td>
                  </Table.Tr>

                  {/* Expanded student rows */}
                  {isExpanded && (
                    <Table.Tr>
                      <Table.Td colSpan={6} p={0}>
                        <Collapse in={isExpanded}>
                          <Box bg="gray.0" p="sm">
                            <Text fw={500} size="sm" mb={6}>
                              Student Performance
                            </Text>

                            <Table
                              withColumnBorders
                              withRowBorders={false}
                              highlightOnHover
                              verticalSpacing="xs"
                              horizontalSpacing="sm"
                            >
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th w="40%">Student</Table.Th>
                                  <Table.Th w="20%">Status</Table.Th>
                                  <Table.Th w="20%">Grade</Table.Th>
                                  <Table.Th w="20%" ta="right">
                                    Actions
                                  </Table.Th>
                                </Table.Tr>
                              </Table.Thead>

                              <Table.Tbody>
                                {assignment.submissions.map((submission) => (
                                  <Table.Tr key={submission.studentId}>
                                    <Table.Td>
                                      <Text size="sm">
                                        {submission.studentName}
                                      </Text>
                                    </Table.Td>

                                    <Table.Td>
                                      <Badge
                                        color={submission.submissionStatus}
                                        variant="light"
                                        size="sm"
                                      >
                                        {submission.submissionStatus}
                                      </Badge>
                                    </Table.Td>

                                    <Table.Td>
                                      {submission.grade ? (
                                        <Text size="sm" fw={500}>
                                          {submission.grade.score}/
                                          {submission.grade.maxScore}
                                        </Text>
                                      ) : (
                                        <Text size="sm" c="dimmed">
                                          Not graded
                                        </Text>
                                      )}
                                    </Table.Td>

                                    <Table.Td ta="right">
                                      <Group
                                        gap={6}
                                        justify="flex-end"
                                        wrap="nowrap"
                                      >
                                        {submission.grade?.feedback && (
                                          <Tooltip
                                            label={submission.grade.feedback}
                                          >
                                            <IconNote size={16} color="blue" />
                                          </Tooltip>
                                        )}
                                        <Button
                                          size="xs"
                                          variant="subtle"
                                          onClick={() =>
                                            console.log(
                                              'Grade:',
                                              assignment.assignmentId,
                                              submission.studentId,
                                            )
                                          }
                                        >
                                          {submission.submissionStatus ===
                                          'graded'
                                            ? 'Edit'
                                            : 'Grade'}
                                        </Button>
                                      </Group>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </Box>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </>
              )
            })}
          </Suspense>
        </Table.Tbody>
      </Table>
    </Box>
  )
}

// --- Admin View Table (read-only oversight with summary stats) ---
function AdminGradesTable({
  assignments,
  viewMode = 'by-assignment',
}: {
  assignments: CourseGradebookForMentor['assignments']
  viewMode?: 'by-assignment' | 'by-student'
}) {
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(
    new Set(),
  )

  const toggleExpand = (assignmentId: string) => {
    const newExpanded = new Set(expandedAssignments)
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId)
    } else {
      newExpanded.add(assignmentId)
    }
    setExpandedAssignments(newExpanded)
  }

  const getDetailedStats = (
    assignment: CourseGradebookForMentor['assignments'][number],
  ) => {
    const scores = assignment.submissions
      .filter((s) => s.grade)
      .map((s) => s.grade!.score)

    const totalSubmissions = assignment.submissions.length
    const gradedSubmissions = scores.length
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const minScore = scores.length > 0 ? Math.min(...scores) : 0
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0

    return {
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions: assignment.submissions.filter(
        (s) => s.submissionStatus === 'pending',
      ).length,
      submittedSubmissions: assignment.submissions.filter(
        (s) => s.submissionStatus === 'submitted',
      ).length,
      averageScore,
      minScore,
      maxScore,
      completionRate: (gradedSubmissions / totalSubmissions) * 100,
      averagePercentage: (averageScore / (assignment.points || 1)) * 100,
    }
  }

  if (viewMode === 'by-student') {
    // Student overview for admin
    const studentMap = new Map()
    let totalPossiblePoints = 0

    assignments.forEach((assignment) => {
      totalPossiblePoints += assignment.points || 0
      assignment.submissions.forEach((submission) => {
        if (!studentMap.has(submission.studentId)) {
          studentMap.set(submission.studentId, {
            studentId: submission.studentId,
            studentName: submission.studentName,
            totalScore: 0,
            totalPossible: 0,
            gradedAssignments: 0,
            totalAssignments: 0,
          })
        }
        const student = studentMap.get(submission.studentId)
        student.totalAssignments++
        if (submission.grade) {
          student.totalScore += submission.grade.score
          student.totalPossible += submission.grade.maxScore
          student.gradedAssignments++
        }
      })
    })

    return (
      <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Card withBorder mb="md" p="md">
          <Title order={4} mb="sm">
            Class Overview
          </Title>
          <Group justify="space-evenly" px={'xl'}>
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Total Students
              </Text>
              <Text size="xl" fw={700}>
                {studentMap.size}
              </Text>
            </Stack>
            <Divider orientation="vertical" />
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Total Assignments
              </Text>
              <Text size="xl" fw={700}>
                {assignments.length}
              </Text>
            </Stack>
            <Divider orientation="vertical" />
            <Stack gap={'xs'} align="center">
              <Text size="sm" c="dimmed">
                Class Average
              </Text>
              <Text size="xl" fw={700}>
                {(
                  Array.from(studentMap.values())
                    .filter((s: any) => s.gradedAssignments > 0)
                    .reduce(
                      (sum: number, s: any) =>
                        sum + (s.totalScore / s.totalPossible) * 100,
                      0,
                    ) /
                  Math.max(
                    1,
                    Array.from(studentMap.values()).filter(
                      (s: any) => s.gradedAssignments > 0,
                    ).length,
                  )
                ).toFixed(1)}
              </Text>
            </Stack>
          </Group>
        </Card>

        <Table
          highlightOnHover
          highlightOnHoverColor="gray.0"
          style={{ borderRadius: rem('8px'), minWidth: '800px' }}
        >
          <Table.Thead>
            <Table.Tr bg={'gray.1'} c={'dark.5'}>
              <Table.Th>Student</Table.Th>
              <Table.Th>Progress</Table.Th>
              <Table.Th>Current Score</Table.Th>
              <Table.Th>Grade Percentage</Table.Th>
              <Table.Th>Trend</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Suspense fallback={<SuspendedTableRows columns={5} />}>
              {Array.from(studentMap.values())
                .sort(
                  (a: any, b: any) =>
                    b.totalScore / Math.max(1, b.totalPossible) -
                    a.totalScore / Math.max(1, a.totalPossible),
                )
                .map((student: any) => {
                  const percentage =
                    student.totalPossible > 0
                      ? (student.totalScore / student.totalPossible) * 100
                      : 0
                  const completionRate =
                    (student.gradedAssignments / student.totalAssignments) * 100

                  return (
                    <Table.Tr key={student.studentId}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>{student.studentName}</Text>
                          <Text size="xs" c="dimmed">
                            ID: {student.studentId}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap="xs">
                          <Progress
                            value={completionRate}
                            size="sm"
                            color="blue"
                          />
                          <Text size="sm">
                            {student.gradedAssignments}/
                            {student.totalAssignments} completed
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>
                          {student.totalScore}/{student.totalPossible}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          fw={500}
                          c={
                            percentage >= 80
                              ? 'green'
                              : percentage >= 60
                                ? 'orange'
                                : 'red'
                          }
                        >
                          {percentage.toFixed(1)}%
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {percentage >= 80 ? (
                          <IconTrendingUp color="green" size={20} />
                        ) : percentage >= 60 ? (
                          <IconMinus color="orange" size={20} />
                        ) : (
                          <IconTrendingDown color="red" size={20} />
                        )}
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
            </Suspense>
          </Table.Tbody>
        </Table>
      </Box>
    )
  }

  // Default: by-assignment view with detailed stats
  return (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <Table
        highlightOnHover
        highlightOnHoverColor="gray.0"
        style={{ borderRadius: rem('8px'), minWidth: '1200px' }}
      >
        <Table.Thead>
          <Table.Tr bg={'gray.1'} c={'dark.5'}>
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Completion</Table.Th>
            <Table.Th>Score Statistics</Table.Th>
            <Table.Th>Class Performance</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Suspense fallback={<SuspendedTableRows columns={6} />}>
            {assignments.map((assignment) => {
              const stats = getDetailedStats(assignment)
              const isExpanded = expandedAssignments.has(
                assignment.assignmentId,
              )

              return (
                <>
                  <Table.Tr key={assignment.assignmentId}>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="transparent"
                          size="sm"
                          onClick={() => toggleExpand(assignment.assignmentId)}
                        >
                          {isExpanded ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                        <div>
                          <Text fw={500}>{assignment.assignmentTitle}</Text>
                          <Text size="sm" c="dimmed">
                            {assignment.points} points
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Progress
                          value={stats.completionRate}
                          size="sm"
                          color="green"
                        />
                        <Group gap="xs">
                          <Text size="xs">
                            Pending: {stats.pendingSubmissions}
                          </Text>
                          <Text size="xs">
                            Submitted: {stats.submittedSubmissions}
                          </Text>
                          <Text size="xs">
                            Graded: {stats.gradedSubmissions}
                          </Text>
                        </Group>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Avg: {stats.averageScore.toFixed(1)}/
                          {assignment.points}
                        </Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Min: {stats.minScore}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Max: {stats.maxScore}
                          </Text>
                        </Group>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Text
                          fw={500}
                          c={
                            stats.averagePercentage >= 80
                              ? 'green'
                              : stats.averagePercentage >= 60
                                ? 'orange'
                                : 'red'
                          }
                        >
                          {stats.averagePercentage.toFixed(1)}%
                        </Text>
                        <Text size="xs" c="dimmed">
                          Class Average
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => toggleExpand(assignment.assignmentId)}
                      >
                        {isExpanded ? 'Hide' : 'View'} Details
                      </Button>
                    </Table.Td>
                  </Table.Tr>

                  {/* Expanded details */}
                  {isExpanded && (
                    <Table.Tr>
                      <Table.Td colSpan={6} p={0}>
                        <Collapse in={isExpanded}>
                          <Box bg="gray.0" p="xs">
                            <Text fw={500} size="sm" mb="xs">
                              Student Performance
                            </Text>
                            <Stack gap={4}>
                              {assignment.submissions.map((submission) => (
                                <Group
                                  key={submission.studentId}
                                  justify="space-between"
                                  py={4}
                                  px="xs"
                                  style={{
                                    borderBottom:
                                      '1px solid var(--mantine-color-gray-3)',
                                  }}
                                >
                                  <div>
                                    <Text size="sm">
                                      {submission.studentName}
                                    </Text>
                                    <Badge
                                      color={submission.submissionStatus}
                                      variant="filled"
                                      size="xs"
                                    >
                                      {submission.submissionStatus}
                                    </Badge>
                                  </div>
                                  <Group gap="xs">
                                    {submission.grade ? (
                                      <Text size="sm" fw={500}>
                                        {submission.grade.score}/
                                        {submission.grade.maxScore}
                                      </Text>
                                    ) : (
                                      <Text size="sm" c="dimmed">
                                        Not graded
                                      </Text>
                                    )}
                                    {submission.grade?.feedback && (
                                      <Tooltip
                                        label={submission.grade.feedback}
                                      >
                                        <IconNote size={16} color="blue" />
                                      </Tooltip>
                                    )}
                                    <Button
                                      size="xs"
                                      variant="subtle"
                                      onClick={() =>
                                        console.log(
                                          'Grade:',
                                          assignment.assignmentId,
                                          submission.studentId,
                                        )
                                      }
                                    >
                                      {submission.submissionStatus === 'graded'
                                        ? 'Edit'
                                        : 'Grade'}
                                    </Button>
                                  </Group>
                                </Group>
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </>
              )
            })}
          </Suspense>
        </Table.Tbody>
      </Table>
    </Box>
  )
}

export default CourseGrades
