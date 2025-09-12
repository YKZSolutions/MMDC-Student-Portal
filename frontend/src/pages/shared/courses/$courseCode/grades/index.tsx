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
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronRight,
  IconMinus,
  IconNote,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Fragment, Suspense, useEffect, useState } from 'react'

function getRoleSpecificContent({
  role,
  studentFiltered,
  mentorFiltered,
  adminFiltered,
  setStudentFiltered,
  setMentorFiltered,
  setAdminFiltered,
}: {
  role: 'student' | 'mentor' | 'admin'
  studentFiltered: StudentAssignmentGrade[]
  mentorFiltered: CourseGradebookForMentor['assignments']
  adminFiltered: CourseGradebookForMentor['assignments']
  setStudentFiltered: React.Dispatch<
    React.SetStateAction<StudentAssignmentGrade[]>
  >
  setMentorFiltered: React.Dispatch<
    React.SetStateAction<CourseGradebookForMentor['assignments']>
  >
  setAdminFiltered: React.Dispatch<
    React.SetStateAction<CourseGradebookForMentor['assignments']>
  >
}) {
  switch (role) {
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
        data: mockMentorGradebook.assignments,
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

  const { data, filtered, onFilter, identifiers } = getRoleSpecificContent({
    role: authUser.role,
    studentFiltered,
    mentorFiltered,
    adminFiltered,
    setStudentFiltered,
    setMentorFiltered,
    setAdminFiltered,
  })

  useEffect(() => {
    if (filtered.length === 0 && data.length > 0) {
      onFilter(data as any)
    }
  }, [data])

  return (
    <Stack gap={'md'} p={'md'}>
      <Group justify="space-between" align="center">
        <Title size={'h2'}>Grades</Title>
        <Group align="start">
          {(authUser.role === 'mentor' || authUser.role === 'admin') && (
            <SegmentedControl
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
              data={[
                { label: 'By Assignment', value: 'by-assignment' },
                { label: 'By Student', value: 'by-student' },
              ]}
              color={'primary'}
            />
          )}
          <TextInput
            placeholder="Search..."
            radius={'md'}
            leftSection={<IconSearch size={18} stroke={1} />}
            w={rem(250)}
          />
        </Group>
      </Group>
      {authUser.role === 'student' && (
        <StudentGradesTable assignments={studentFiltered} />
      )}
      {authUser.role === 'mentor' && (
        <ElevatedRoleGradesTable
          assignments={mentorFiltered}
          viewMode={viewMode}
        />
      )}
      {authUser.role === 'admin' && (
        <ElevatedRoleGradesTable
          assignments={adminFiltered}
          viewMode={viewMode}
        />
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
              <Table.Th>Due At</Table.Th>
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

function ElevatedRoleGradesTable({
  assignments,
  viewMode = 'by-assignment',
}: {
  assignments: CourseGradebookForMentor['assignments']
  viewMode?: 'by-assignment' | 'by-student'
}) {
  const theme = useMantineTheme()

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
    return <ElevatedRoleGradesTableByStudent assignments={assignments} />
  }

  // Default: by-assignment view with detailed stats
  return (
    <Box>
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
            <Table.Th>Completion Rate</Table.Th>
            <Table.Th>Score Statistics</Table.Th>
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
                  <Table.Tr
                    key={assignment.assignmentId}
                    onClick={() => toggleExpand(assignment.assignmentId)}
                    style={{ cursor: 'pointer' }}
                  >
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
                        <Box>
                          <Text fw={500}>{assignment.assignmentTitle}</Text>
                          <Text size="sm" c="dimmed">
                            {assignment.points} points
                          </Text>
                        </Box>
                      </Group>
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
                      <Text fw={500} c="dark.5">
                        {stats.completionRate || 0}%
                      </Text>
                      <Text size="xs" c="dimmed">
                        {stats.gradedSubmissions}/{stats.totalSubmissions}{' '}
                        completed
                      </Text>
                      <Progress value={stats.completionRate} color={'blue'} />
                    </Table.Td>
                    <Table.Td>
                      <Box>
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
                        <Text size="xs" fw={500} c={'dimmed'}>
                          Avg: {stats.averageScore.toFixed(1)}/
                          {assignment.points}
                        </Text>

                        <Group gap="xs">
                          <Text size="xs" fw={500} c="dimmed">
                            Min: {stats.minScore}
                          </Text>
                          <Text size="xs" fw={500} c="dimmed">
                            Max: {stats.maxScore}
                          </Text>
                        </Group>
                      </Box>
                    </Table.Td>
                  </Table.Tr>

                  {/* Expanded details */}
                  <Table.Tr bd={0}>
                    <Table.Td colSpan={4} p={0}>
                      <Collapse in={isExpanded}>
                        <AssignmentRowByAssignment assignment={assignment} />
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </>
              )
            })}
          </Suspense>
        </Table.Tbody>
      </Table>
    </Box>
  )
}

function AssignmentRowByAssignment({
  assignment,
}: {
  assignment: CourseGradebookForMentor['assignments'][number]
}) {
  const theme = useMantineTheme()
  return (
    <Box bg="gray.0" p="lg">
      <Text fw={500} size="sm" mb="xs">
        Student Performance
      </Text>
      <Stack gap={4}>
        {assignment.submissions.map((submission) => (
          <Group
            key={submission.studentId}
            justify="space-between"
            py={'sm'}
            px="xs"
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Box>
              <Text size="sm">{submission.studentName}</Text>
              <Badge
                color={submission.submissionStatus}
                variant="filled"
                size="xs"
              >
                {submission.submissionStatus}
              </Badge>
            </Box>
            <Group gap="xs">
              {submission.grade ? (
                <Text size="sm" fw={500} c={'dark.5'}>
                  {submission.grade.score}/{submission.grade.maxScore}
                </Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Not graded
                </Text>
              )}
              {submission.grade?.feedback && (
                <Tooltip label={submission.grade.feedback}>
                  <IconNote size={16} color={theme.colors.dark[4]} />
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
                {submission.submissionStatus === 'graded' ? 'Edit' : 'Grade'}
              </Button>
            </Group>
          </Group>
        ))}
      </Stack>
    </Box>
  )
}

function ElevatedRoleGradesTableByStudent({
  assignments,
}: {
  assignments: CourseGradebookForMentor['assignments']
}) {
  const [isStudentExpanded, { toggle: toggleStudent }] = useDisclosure(false)
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
          assignments: [],
        })
      }
      const student = studentMap.get(submission.studentId)
      student.totalAssignments++
      if (submission.grade) {
        student.totalScore += submission.grade.score
        student.totalPossible += submission.grade.maxScore
        student.gradedAssignments++
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
                  <Fragment key={student.studentId}>
                    <Table.Tr
                      key={student.studentId}
                      onClick={toggleStudent}
                      style={{ cursor: 'pointer' }}
                    >
                      <Table.Td>
                        <Box>
                          <Text fw={500}>{student.studentName}</Text>
                          <Text size="xs" c="dimmed">
                            ID: {student.studentId}
                          </Text>
                        </Box>
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
                    <Table.Tr>
                      <Table.Td
                        colSpan={6}
                        p={0}
                        style={{ background: '#f8f9fa' }}
                      >
                        <Collapse in={isStudentExpanded}>
                          <Stack p={'md'} gap={'xs'}>
                            {Array.from(studentMap.values()).flatMap(
                              (student: any) =>
                                student.assignments.map(
                                  (assignmentWithSubmission: any) => (
                                    <AssignmentRowByStudent
                                      key={`${student.studentId}-${assignmentWithSubmission.assignmentId}`}
                                      assignmentWithSubmission={
                                        assignmentWithSubmission
                                      }
                                      student={student}
                                    />
                                  ),
                                ),
                            )}
                          </Stack>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  </Fragment>
                )
              })}
          </Suspense>
        </Table.Tbody>
      </Table>
    </Box>
  )
}

function AssignmentRowByStudent({
  assignmentWithSubmission,
  student,
}: {
  assignmentWithSubmission: any
  student: any
}) {
  return (
    <Card radius="md" withBorder>
      <Group justify="space-between" align="center" style={{ width: '100%' }}>
        {/* Assignment title & due */}
        <Box style={{ minWidth: 180 }}>
          <Text fw={500} size="md">
            {assignmentWithSubmission.assignmentTitle}
          </Text>
          <Text size="xs" c="dimmed">
            {assignmentWithSubmission.points} points
          </Text>
          <Text size="xs" c="dimmed">
            {formatTimestampToDateTimeText(
              assignmentWithSubmission.dueDate,
              'by',
            )}
          </Text>
          <Badge
            color={assignmentWithSubmission.submission.submissionStatus}
            variant="filled"
            size="md"
            style={{
              textTransform: 'capitalize',
              fontWeight: 600,
            }}
          >
            {assignmentWithSubmission.submission.submissionStatus.replace(
              /-/g,
              ' ',
            )}
          </Badge>
        </Box>

        <Group>
          {/* Grade */}
          <Box
            style={{
              minWidth: 120,
              textAlign: 'right',
            }}
          >
            {assignmentWithSubmission.submission.grade ? (
              <>
                <Text fw={700} size="md">
                  {assignmentWithSubmission.submission.grade.score} /{' '}
                  {assignmentWithSubmission.submission.grade.maxScore}
                </Text>
                <Text size="xs" c="dimmed">
                  {assignmentWithSubmission.submission.grade.gradedAt &&
                    `Graded ${formatTimestampToDateTimeText(assignmentWithSubmission.submission.grade.gradedAt)}`}
                </Text>
              </>
            ) : (
              <Text c="dimmed" fw={500} size="md">
                - / {assignmentWithSubmission.points}
              </Text>
            )}
          </Box>

          {/* Action button */}
          <Button
            size="xs"
            variant="light"
            style={{ minWidth: 64 }}
            onClick={() => {
              console.log(
                'Grade assignment:',
                assignmentWithSubmission.assignmentId,
                student.studentId,
              )
            }}
          >
            {assignmentWithSubmission.submission.submissionStatus === 'graded'
              ? 'Edit'
              : 'Grade'}
          </Button>
        </Group>
      </Group>
    </Card>
  )
}

export default CourseGrades
