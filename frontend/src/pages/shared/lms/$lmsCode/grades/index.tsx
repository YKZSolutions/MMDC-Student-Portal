import SuspendedTableRows from '@/components/suspended-table-rows'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  CourseGradebookForMentor,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
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
import { useSuspenseQuery } from '@tanstack/react-query'
import type {
  AssignmentSubmissionDto,
  BasicAssignmentSubmissionItemWithGrade,
  FullGradableAssignmentItem,
  StudentViewGradeEntryDto,
} from '@/integrations/api/client'
import {
  gradingControllerGetAdminGradebookOptions,
  gradingControllerGetMentorGradebookOptions,
  gradingControllerGetStudentGradebookOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import Decimal from 'decimal.js'
import { useParams } from '@tanstack/react-router'
import { Route } from '@/routes/(protected)/lms/$lmsCode.tsx'

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
  studentFiltered: StudentViewGradeEntryDto[]
  mentorFiltered: FullGradableAssignmentItem[]
  adminFiltered: FullGradableAssignmentItem[]
  setStudentFiltered: React.Dispatch<
    React.SetStateAction<StudentViewGradeEntryDto[]>
  >
  setMentorFiltered: React.Dispatch<
    React.SetStateAction<FullGradableAssignmentItem[]>
  >
  setAdminFiltered: React.Dispatch<
    React.SetStateAction<FullGradableAssignmentItem[]>
  >
}) {
  const { lmsCode } = Route.useParams()
  switch (role) {
    case 'student': {
      const { data } = useSuspenseQuery(
        gradingControllerGetStudentGradebookOptions({
          query: {
            moduleId: lmsCode,
          },
        }),
      )
      return {
        data: data.gradeRecords,
        filtered: studentFiltered,
        onFilter: setStudentFiltered,
        identifiers: ['assignmentTitle'] as const,
      }
    }
    case 'mentor': {
      const { data } = useSuspenseQuery(
        gradingControllerGetMentorGradebookOptions({
          query: {
            moduleId: lmsCode,
          },
        }),
      )
      return {
        data: data.gradeRecords,
        filtered: mentorFiltered,
        onFilter: setMentorFiltered,
        identifiers: [
          'assignmentTitle',
          ['submissions', 'studentName'],
        ] as const,
      }
    }
    case 'admin': {
      const { data } = useSuspenseQuery(
        gradingControllerGetAdminGradebookOptions({
          query: {
            moduleId: lmsCode,
          },
        }),
      )
      return {
        data: data.gradeRecords,
        filtered: adminFiltered,
        onFilter: setAdminFiltered,
        identifiers: [
          'assignmentTitle',
          ['submissions', 'studentName'],
        ] as const,
      }
    }
    default:
      throw new Error('Invalid role')
  }
}

function CourseGrades() {
  const { authUser } = useAuth('protected')
  const [studentFiltered, setStudentFiltered] = useState<
    StudentViewGradeEntryDto[]
  >([])
  const [mentorFiltered, setMentorFiltered] = useState<
    FullGradableAssignmentItem[]
  >([])
  const [adminFiltered, setAdminFiltered] = useState<
    FullGradableAssignmentItem[]
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
        <Title c="dark.7" variant="hero" order={2} fw={700}>
          Grades
        </Title>
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
        <StudentGradesTable gradeBook={studentFiltered} />
      )}
      {authUser.role === 'mentor' && (
        <ElevatedRoleGradesTable
          gradeBook={mentorFiltered}
          viewMode={viewMode}
        />
      )}
      {authUser.role === 'admin' && (
        <ElevatedRoleGradesTable
          gradeBook={adminFiltered}
          viewMode={viewMode}
        />
      )}
    </Stack>
  )
}

function StudentGradesTable({
  gradeBook,
}: {
  gradeBook: StudentViewGradeEntryDto[]
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
              {gradeBook.map((grade) => {
                const latestSubmission = grade?.submission.reduce(
                  (latest, current) => {
                    if (!latest) return current

                    const currentDate = current.submittedAt
                      ? new Date(current.submittedAt)
                      : new Date(0)
                    const latestDate = latest.submittedAt
                      ? new Date(latest.submittedAt)
                      : new Date(0)

                    if (currentDate > latestDate) return current
                    if (current.attemptNumber > latest.attemptNumber)
                      return current
                    return latest
                  },
                  undefined as AssignmentSubmissionDto | undefined,
                )

                // Determine if this is a group grade
                const isGroupAssignment =
                  latestSubmission?.groupSnapshot !== undefined

                return (
                  <Table.Tr key={grade?.gradableItem.moduleContentId}>
                    <Table.Td>
                      <Box>
                        <Text fw={500}>{grade?.gradableItem?.title}</Text>
                        <Text size="sm" c="dimmed">
                          {grade.currentGrade?.finalScore} points
                          {isGroupAssignment && ' (Group)'}
                        </Text>
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm" c={'dark.4'}>
                        {grade?.gradableItem?.dueDate
                          ? formatTimestampToDateTimeText(
                              grade?.gradableItem?.dueDate,
                              'by',
                            )
                          : 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm" c={'dark.4'}>
                        {latestSubmission?.submittedAt
                          ? formatTimestampToDateTimeText(
                              latestSubmission.submittedAt,
                            )
                          : 'Not Submitted'}
                        {grade?.gradableItem?.allowLateSubmission && (
                          <Text size="xs" c="red.4" fw={500}>
                            {latestSubmission?.lateDays} day(s) late
                          </Text>
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {grade.currentGrade ? (
                        <Box>
                          <Text fw={500} c={'dark.4'}>
                            {grade?.currentGrade?.finalScore} /{' '}
                            {grade.gradableItem?.maxScore}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {grade.currentGrade?.gradedAt &&
                              `Graded ${formatTimestampToDateTimeText(grade.currentGrade?.gradedAt)}`}
                          </Text>
                        </Box>
                      ) : (
                        <Text c="dimmed">
                          - / {grade?.gradableItem?.maxScore}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {grade.currentGrade?.feedback ? (
                        <Tooltip label={grade.currentGrade.feedback}>
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
  gradeBook = [],
  viewMode = 'by-assignment',
}: {
  gradeBook: FullGradableAssignmentItem[]
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
    assignment: FullGradableAssignmentItem[][number],
  ) => {
    const scores = assignment.submissions
      .filter((s) => s.currentGrade?.finalScore != null)
      .map((s) => new Decimal(s.currentGrade!.finalScore))

    const totalSubmissions = assignment.submissions.length
    const gradedSubmissions = scores.length
    const averageScore =
      scores.length > 0
        ? Number(
            scores
              .reduce((a, b) => a.plus(b), new Decimal(0))
              .div(scores.length),
          )
        : 0
    const minScore =
      scores.length > 0 ? Math.min(...scores.map((s) => s.toNumber())) : 0
    const maxScore =
      scores.length > 0 ? Math.max(...scores.map((s) => s.toNumber())) : 0

    return {
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions: assignment.submissions.filter(
        (s) => s.state === 'DRAFT',
      ).length,
      submittedSubmissions: assignment.submissions.filter(
        (s) => s.state === 'SUBMITTED',
      ).length,
      averageScore,
      minScore,
      maxScore,
      completionRate: (gradedSubmissions / totalSubmissions) * 100,
      averagePercentage: (averageScore / (assignment.maxScore || 1)) * 100,
    }
  }

  if (viewMode === 'by-student') {
    return <ElevatedRoleGradesTableByStudent assignments={gradeBook} />
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
            {gradeBook.map((assignment) => {
              const stats = getDetailedStats(assignment)
              const isExpanded = expandedAssignments.has(assignment.contentId)

              return (
                <>
                  <Table.Tr
                    key={assignment.contentId}
                    onClick={() => toggleExpand(assignment.contentId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="transparent"
                          size="sm"
                          onClick={() => toggleExpand(assignment.contentId)}
                        >
                          {isExpanded ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                        <Box>
                          <Text fw={500}>{assignment.title}</Text>
                          <Text size="sm" c="dimmed">
                            {assignment.maxScore} points
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm" c={'dark.4'}>
                        {assignment.dueDate
                          ? formatTimestampToDateTimeText(
                              assignment.dueDate,
                              'by',
                            )
                          : 'N/A'}
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
                          {assignment.maxScore}
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
  assignment: FullGradableAssignmentItem[][number]
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
            key={submission.student.id}
            justify="space-between"
            py={'sm'}
            px="xs"
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Box>
              <Text size="sm">
                {submission.student.firstName +
                  ' ' +
                  submission.student.lastName}
              </Text>
              <Badge color={submission.state} variant="filled" size="xs">
                {submission.state}
              </Badge>
            </Box>
            <Group gap="xs">
              {submission.currentGrade ? (
                <Text size="sm" fw={500} c={'dark.5'}>
                  {submission.currentGrade.finalScore}/{assignment.maxScore}
                </Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Not graded
                </Text>
              )}
              {submission.currentGrade?.feedback && (
                <Tooltip label={submission.currentGrade.feedback}>
                  <IconNote size={16} color={theme.colors.dark[4]} />
                </Tooltip>
              )}
              <Button
                size="xs"
                variant="subtle"
                onClick={() =>
                  console.log(
                    'Grade:',
                    assignment.contentId,
                    submission.student.id,
                  )
                }
              >
                {submission.state === 'GRADED' ? 'Edit' : 'Grade'}
              </Button>
            </Group>
          </Group>
        ))}
      </Stack>
    </Box>
  )
}

export type AssignmentWithSubmission = FullGradableAssignmentItem & {
  submission: BasicAssignmentSubmissionItemWithGrade
}

// Aggregated stats per student
export interface StudentAggregate {
  studentId: string
  studentName: string
  totalScore: number
  totalPossible: number
  gradedAssignments: number
  totalAssignments: number
  assignments: AssignmentWithSubmission[]
}

function ElevatedRoleGradesTableByStudent({
  assignments,
}: {
  assignments: FullGradableAssignmentItem[]
}) {
  const [isStudentExpanded, { toggle: toggleStudent }] = useDisclosure(false)
  const studentMap = new Map<string, StudentAggregate>()
  let totalPossiblePoints = 0

  assignments.forEach((assignment) => {
    totalPossiblePoints += assignment.maxScore || 0

    assignment.submissions.forEach((submission) => {
      const studentId = submission.student.id

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName: `${submission.student.firstName} ${submission.student.lastName}`,
          totalScore: 0,
          totalPossible: 0,
          gradedAssignments: 0,
          totalAssignments: 0,
          assignments: [],
        })
      }

      const student = studentMap.get(studentId)!
      student.totalAssignments++

      const finalScore = submission.currentGrade?.finalScore
      if (finalScore !== undefined && finalScore !== null) {
        const numericScore = Number(finalScore)
        if (!isNaN(numericScore)) {
          student.totalScore += numericScore
          student.totalPossible += assignment.maxScore
          student.gradedAssignments++
        }
      }

      student.assignments.push({
        ...assignment,
        submission,
      })
    })
  })

  const students = Array.from(studentMap.values())

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
                students
                  .filter((s) => s.gradedAssignments > 0)
                  .reduce(
                    (sum, s) => sum + (s.totalScore / s.totalPossible) * 100,
                    0,
                  ) /
                Math.max(
                  1,
                  students.filter((s) => s.gradedAssignments > 0).length,
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
                          <Stack p="md" gap="xs">
                            {student.assignments.map((a: any) => (
                              <AssignmentRowByStudent
                                key={`${student.studentId}-${a.contentId}`}
                                assignmentWithSubmission={a}
                                student={student}
                              />
                            ))}
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
  assignmentWithSubmission: AssignmentWithSubmission
  student: StudentAggregate
}) {
  const submission = assignmentWithSubmission.submission
  const status = assignmentWithSubmission.submission?.state

  return (
    <Card radius="md" withBorder>
      <Group justify="space-between" align="center" style={{ width: '100%' }}>
        {/* Assignment title & due */}
        <Box style={{ minWidth: 180 }}>
          <Text fw={500} size="md">
            {assignmentWithSubmission.title}
          </Text>
          <Text size="xs" c="dimmed">
            {assignmentWithSubmission.maxScore} points
          </Text>
          {assignmentWithSubmission.dueDate && (
            <Text size="xs" c="dimmed">
              {formatTimestampToDateTimeText(
                assignmentWithSubmission.dueDate,
                'by',
              )}
            </Text>
          )}
          <Badge
            color={status}
            variant="filled"
            size="md"
            style={{
              textTransform: 'capitalize',
              fontWeight: 600,
            }}
          >
            {status.replace(/-/g, ' ')}
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
            {submission?.currentGrade ? (
              <>
                <Text fw={700} size="md">
                  {submission.currentGrade?.finalScore} /{' '}
                  {assignmentWithSubmission.maxScore}
                </Text>
                <Text size="xs" c="dimmed">
                  {submission.currentGrade.gradedAt &&
                    `Graded ${formatTimestampToDateTimeText(
                      submission.currentGrade.gradedAt,
                    )}`}
                </Text>
              </>
            ) : (
              <Text c="dimmed" fw={500} size="md">
                - / {assignmentWithSubmission.maxScore}
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
                assignmentWithSubmission.contentId,
                student.studentId,
              )
            }}
          >
            {status === 'GRADED' ? 'Edit' : 'Grade'}
          </Button>
        </Group>
      </Group>
    </Card>
  )
}

export default CourseGrades
