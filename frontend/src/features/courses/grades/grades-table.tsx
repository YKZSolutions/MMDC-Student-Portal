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
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { Suspense, useState } from 'react'
import type {
  CourseGradebookForMentor,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SuspendedTableRows from '@/components/suspended-table-rows.tsx'
import {
  IconChevronDown,
  IconChevronRight,
  IconMinus,
  IconNote,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'

const StudentGradesTable = ({
  assignments,
}: {
  assignments: StudentAssignmentGrade[]
}) => (
  <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
    <Table
      highlightOnHover
      highlightOnHoverColor="gray.0"
      style={{ borderRadius: rem('8px'), minWidth: '800px' }}
    >
      <Table.Thead>
        <Table.Tr bg={'gray.1'} c={'dark.5'}>
          <Table.Th>Assignment</Table.Th>
          <Table.Th>Due</Table.Th>
          <Table.Th>Submitted At</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Grade</Table.Th>
          <Table.Th>Feedback</Table.Th>
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
                  <div>
                    <Text fw={500}>{assignment.assignmentTitle}</Text>
                    <Text size="sm" c="dimmed">
                      {assignment.points} points
                      {isGroupAssignment && ' (Group)'}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                </Table.Td>
                <Table.Td>
                  {latestSubmission?.submittedAt
                    ? formatTimestampToDateTimeText(
                        latestSubmission.submittedAt,
                      )
                    : 'Not Submitted'}
                  {latestSubmission?.isLate && (
                    <Text size="xs" c="red">
                      {latestSubmission.lateDays} day(s) late
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={latestSubmission?.submissionStatus}
                    variant="filled"
                    size="sm"
                  >
                    {latestSubmission?.submissionStatus || 'pending'}
                  </Badge>
                  {assignment.submissions.length > 1 && (
                    <Text size="xs" c="dimmed">
                      {assignment.submissions.length} attempts
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {assignment.currentGrade ? (
                    <div>
                      <Text fw={500}>
                        {assignment.currentGrade.score} /{' '}
                        {assignment.currentGrade.maxScore}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {assignment.currentGrade.gradedAt &&
                          `Graded ${formatTimestampToDateTimeText(assignment.currentGrade.gradedAt)}`}
                      </Text>
                    </div>
                  ) : (
                    <Text c="dimmed">- / {assignment.points}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {assignment.currentGrade?.feedback ? (
                    <Tooltip label={assignment.currentGrade.feedback}>
                      <IconNote size={20} color="blue" />
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
  </Box>
)

const MentorGradesTable = ({
  assignments,
  viewMode = 'by-assignment',
}: {
  assignments: CourseGradebookForMentor['assignments']
  viewMode?: 'by-assignment' | 'by-student'
}) => {
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
                      <Table.Td colSpan={5} p={0}>
                        <Collapse in={isExpanded}>
                          <Box bg="gray.0" p="md">
                            <Stack gap="xs">
                              {assignment.submissions.map((submission) => (
                                <Card
                                  key={submission.studentId}
                                  withBorder
                                  p="sm"
                                >
                                  <Group justify="space-between">
                                    <div>
                                      <Text fw={500}>
                                        {submission.studentName}
                                      </Text>
                                      <Group gap="xs">
                                        <Badge
                                          color={submission.submissionStatus}
                                          variant="filled"
                                          size="xs"
                                        >
                                          {submission.submissionStatus}
                                        </Badge>
                                        {submission.submissionTimestamp && (
                                          <Text size="xs" c="dimmed">
                                            {formatTimestampToDateTimeText(
                                              submission.submissionTimestamp,
                                            )}
                                          </Text>
                                        )}
                                      </Group>
                                    </div>
                                    <Group gap="xs">
                                      <div>
                                        {submission.grade ? (
                                          <Text fw={500}>
                                            {submission.grade.score}/
                                            {submission.grade.maxScore}
                                          </Text>
                                        ) : (
                                          <Text c="dimmed">Not graded</Text>
                                        )}
                                      </div>
                                      {submission.grade?.feedback && (
                                        <Tooltip
                                          label={submission.grade.feedback}
                                        >
                                          <IconNote size={16} color="blue" />
                                        </Tooltip>
                                      )}
                                      <Button
                                        size="xs"
                                        variant="light"
                                        onClick={() => {
                                          console.log(
                                            'Grade:',
                                            assignment.assignmentId,
                                            submission.studentId,
                                          )
                                        }}
                                      >
                                        {submission.submissionStatus ===
                                        'graded'
                                          ? 'Edit'
                                          : 'Grade'}
                                      </Button>
                                    </Group>
                                  </Group>
                                </Card>
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

// --- Admin View Table (read-only oversight with summary stats) ---
const AdminGradesTable = ({
  assignments,
  viewMode = 'by-assignment',
}: {
  assignments: CourseGradebookForMentor['assignments']
  viewMode?: 'by-assignment' | 'by-student'
}) => {
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
          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">
                Total Students
              </Text>
              <Text size="xl" fw={700}>
                {studentMap.size}
              </Text>
            </div>
            <Divider orientation="vertical" />
            <div>
              <Text size="sm" c="dimmed">
                Total Assignments
              </Text>
              <Text size="xl" fw={700}>
                {assignments.length}
              </Text>
            </div>
            <Divider orientation="vertical" />
            <div>
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
            </div>
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
                          <Box bg="gray.0" p="md">
                            <Group justify="space-between" align="start">
                              <Stack gap="xs" style={{ flex: 1 }}>
                                <Text fw={500} size="sm">
                                  Student Performance
                                </Text>
                                {assignment.submissions
                                  .sort(
                                    (a, b) =>
                                      (b.grade?.score || 0) -
                                      (a.grade?.score || 0),
                                  )
                                  .map((submission) => (
                                    <Group
                                      key={submission.studentId}
                                      justify="space-between"
                                    >
                                      <Text size="sm">
                                        {submission.studentName}
                                      </Text>
                                      <Group gap="xs">
                                        <Badge
                                          color={submission.submissionStatus}
                                          variant="filled"
                                          size="xs"
                                        >
                                          {submission.submissionStatus}
                                        </Badge>
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
                                      </Group>
                                    </Group>
                                  ))}
                              </Stack>
                            </Group>
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

export { StudentGradesTable, MentorGradesTable, AdminGradesTable }
