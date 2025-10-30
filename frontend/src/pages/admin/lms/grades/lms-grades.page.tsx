import { gradingControllerGetAdminGradebookOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import type {
  BasicAssignmentSubmissionItemWithGrade,
  FullGradableAssignmentItem,
} from '@/integrations/api/client/types.gen'
import { formatTimestampToDateTimeText } from '@/utils/formatters'
import {
  ActionIcon,
  Badge,
  Box,
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
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronRight,
  IconMinus,
  IconNote,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import Decimal from 'decimal.js'
import { Fragment, useMemo, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/grades/')

type ViewMode = 'by-assignment' | 'by-student'

export default function LMSGradesPage() {
  const { lmsCode } = route.useParams()
  const [viewMode, setViewMode] = useState<ViewMode>('by-assignment')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300)

  const { data } = useSuspenseQuery(
    gradingControllerGetAdminGradebookOptions({
      query: {
        moduleId: lmsCode,
      },
    }),
  )

  const { gradeRecords } = data

  // Filter grade records based on search
  const filteredGrades = useMemo(() => {
    if (!debouncedSearch.trim()) return gradeRecords

    const query = debouncedSearch.toLowerCase()
    return gradeRecords.filter((record) => {
      // Search by assignment title
      if (record.title.toLowerCase().includes(query)) return true

      // Search by student name
      return record.submissions.some((submission) => {
        const fullName =
          `${submission.student.firstName} ${submission.student.lastName}`.toLowerCase()
        return fullName.includes(query)
      })
    })
  }, [gradeRecords, debouncedSearch])

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between" align="center">
        <Title c="dark.7" order={2} fw={700}>
          Grades
        </Title>
        <Group>
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            data={[
              { label: 'By Assignment', value: 'by-assignment' },
              { label: 'By Student', value: 'by-student' },
            ]}
            color="primary"
          />
          <TextInput
            placeholder="Search assignments or students..."
            radius="md"
            leftSection={<IconSearch size={18} stroke={1.5} />}
            w={rem(280)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </Group>
      </Group>

      {viewMode === 'by-assignment' ? (
        <GradesByAssignment gradeBook={filteredGrades} />
      ) : (
        <GradesByStudent gradeBook={filteredGrades} />
      )}
    </Stack>
  )
}

// ============================================================================
// By Assignment View
// ============================================================================

function GradesByAssignment({
  gradeBook,
}: {
  gradeBook: FullGradableAssignmentItem[]
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

  const getStats = (assignment: FullGradableAssignmentItem) => {
    const scores = assignment.submissions
      .filter((s) => s.currentGrade?.finalScore != null)
      .map((s) => new Decimal(s.currentGrade!.finalScore))

    const totalSubmissions = assignment.submissions.length
    const gradedCount = scores.length
    const avgScore =
      scores.length > 0
        ? scores.reduce((a, b) => a.plus(b), new Decimal(0)).div(scores.length)
        : new Decimal(0)
    const minScore = scores.length > 0 ? Decimal.min(...scores) : new Decimal(0)
    const maxScore = scores.length > 0 ? Decimal.max(...scores) : new Decimal(0)

    const completionRate =
      totalSubmissions > 0 ? (gradedCount / totalSubmissions) * 100 : 0
    const avgPercentage = assignment.maxScore
      ? avgScore.div(assignment.maxScore).mul(100).toNumber()
      : 0

    return {
      totalSubmissions,
      gradedCount,
      avgScore: avgScore.toNumber(),
      minScore: minScore.toNumber(),
      maxScore: maxScore.toNumber(),
      completionRate,
      avgPercentage,
    }
  }

  if (gradeBook.length === 0) {
    return (
      <Card withBorder>
        <Text ta="center" c="dimmed" py="xl">
          No assignments found
        </Text>
      </Card>
    )
  }

  return (
    <Table.ScrollContainer minWidth={rem(800)}>
      <Table
        highlightOnHover
        style={{ borderRadius: rem(8), overflow: 'hidden' }}
        verticalSpacing="lg"
      >
        <Table.Thead>
          <Table.Tr
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
            }}
            bg="gray.1"
            c="dark.5"
          >
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Completion</Table.Th>
            <Table.Th>Statistics</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {gradeBook.map((assignment) => {
            const stats = getStats(assignment)
            const isExpanded = expandedAssignments.has(assignment.contentId)

            return (
              <Fragment key={assignment.contentId}>
                <Table.Tr
                  onClick={() => toggleExpand(assignment.contentId)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="transparent" size="sm">
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
                    <Text fw={500} size="sm" c="dark.4">
                      {assignment.dueDate
                        ? formatTimestampToDateTimeText(
                            assignment.dueDate,
                            'by',
                          )
                        : 'No due date'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} c="dark.5">
                      {stats.completionRate.toFixed(0)}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      {stats.gradedCount}/{stats.totalSubmissions} graded
                    </Text>
                    <Progress
                      value={stats.completionRate}
                      color="blue"
                      mt={4}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text
                      fw={500}
                      c={
                        stats.avgPercentage >= 80
                          ? 'green'
                          : stats.avgPercentage >= 60
                            ? 'orange'
                            : 'red'
                      }
                    >
                      {stats.avgPercentage.toFixed(1)}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      Avg: {stats.avgScore.toFixed(1)}/{assignment.maxScore}
                    </Text>
                    <Group gap="xs" mt={2}>
                      <Text size="xs" c="dimmed">
                        Min: {stats.minScore.toFixed(1)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Max: {stats.maxScore.toFixed(1)}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td colSpan={4} p={0}>
                    <Collapse in={isExpanded}>
                      <Box bg="gray.0" p="lg">
                        <Text fw={500} size="sm" mb="md">
                          Student Submissions
                        </Text>
                        <Stack gap="xs">
                          {assignment.submissions.map((submission) => (
                            <Group
                              key={submission.student.id}
                              justify="space-between"
                              p="sm"
                              style={{
                                borderRadius: rem(8),
                                border: '1px solid var(--mantine-color-gray-3)',
                                backgroundColor: 'white',
                              }}
                            >
                              <Box>
                                <Text size="sm" fw={500}>
                                  {submission.student.firstName}{' '}
                                  {submission.student.lastName}
                                </Text>
                                <Badge
                                  size="xs"
                                  variant="dot"
                                  color={
                                    submission.state === 'GRADED'
                                      ? 'green'
                                      : submission.state === 'SUBMITTED'
                                        ? 'blue'
                                        : 'gray'
                                  }
                                >
                                  {submission.state}
                                </Badge>
                              </Box>
                              <Group gap="sm">
                                {submission.currentGrade ? (
                                  <Box ta="right">
                                    <Text size="sm" fw={500} c="dark.5">
                                      {submission.currentGrade.finalScore}/
                                      {assignment.maxScore}
                                    </Text>
                                    {submission.currentGrade.gradedAt && (
                                      <Text size="xs" c="dimmed">
                                        {formatTimestampToDateTimeText(
                                          submission.currentGrade.gradedAt,
                                        )}
                                      </Text>
                                    )}
                                  </Box>
                                ) : (
                                  <Text size="sm" c="dimmed">
                                    Not graded
                                  </Text>
                                )}
                                {submission.currentGrade?.feedback && (
                                  <Tooltip
                                    label={submission.currentGrade.feedback}
                                  >
                                    <IconNote size={18} />
                                  </Tooltip>
                                )}
                              </Group>
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    </Collapse>
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            )
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

// ============================================================================
// By Student View
// ============================================================================

type AssignmentWithSubmission = FullGradableAssignmentItem & {
  submission: BasicAssignmentSubmissionItemWithGrade
}

interface StudentAggregate {
  studentId: string
  studentName: string
  totalScore: number
  totalPossible: number
  gradedCount: number
  totalAssignments: number
  assignments: AssignmentWithSubmission[]
}

function GradesByStudent({
  gradeBook,
}: {
  gradeBook: FullGradableAssignmentItem[]
}) {
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
    new Set(),
  )

  const toggleExpand = (studentId: string) => {
    const newExpanded = new Set(expandedStudents)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedStudents(newExpanded)
  }

  // Aggregate data by student
  const students = useMemo(() => {
    const studentMap = new Map<string, StudentAggregate>()

    gradeBook.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        const studentId = submission.student.id

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            studentId,
            studentName: `${submission.student.firstName} ${submission.student.lastName}`,
            totalScore: 0,
            totalPossible: 0,
            gradedCount: 0,
            totalAssignments: 0,
            assignments: [],
          })
        }

        const student = studentMap.get(studentId)!
        student.totalAssignments++

        const grade = submission.currentGrade
        if (grade?.finalScore != null) {
          const score = Number(grade.finalScore)
          if (!isNaN(score)) {
            student.totalScore += score
            student.totalPossible += assignment.maxScore
            student.gradedCount++
          }
        }

        student.assignments.push({
          ...assignment,
          submission,
        })
      })
    })

    // Sort by percentage descending
    return Array.from(studentMap.values()).sort((a, b) => {
      const aPercent = a.totalPossible > 0 ? a.totalScore / a.totalPossible : 0
      const bPercent = b.totalPossible > 0 ? b.totalScore / b.totalPossible : 0
      return bPercent - aPercent
    })
  }, [gradeBook])

  // Calculate class statistics
  const classStats = useMemo(() => {
    const studentsWithGrades = students.filter((s) => s.gradedCount > 0)
    const avgPercentage =
      studentsWithGrades.length > 0
        ? studentsWithGrades.reduce(
            (sum, s) => sum + (s.totalScore / s.totalPossible) * 100,
            0,
          ) / studentsWithGrades.length
        : 0

    return {
      totalStudents: students.length,
      totalAssignments: gradeBook.length,
      avgPercentage,
    }
  }, [students, gradeBook])

  if (students.length === 0) {
    return (
      <Card withBorder>
        <Text ta="center" c="dimmed" py="xl">
          No student data found
        </Text>
      </Card>
    )
  }

  return (
    <Stack>
      {/* Class Overview Card */}
      <Card withBorder p="md">
        <Title order={4} mb="sm">
          Class Overview
        </Title>
        <Group justify="space-evenly" px="xl">
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Total Students
            </Text>
            <Text size="xl" fw={700}>
              {classStats.totalStudents}
            </Text>
          </Stack>
          <Divider orientation="vertical" />
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Total Assignments
            </Text>
            <Text size="xl" fw={700}>
              {classStats.totalAssignments}
            </Text>
          </Stack>
          <Divider orientation="vertical" />
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Class Average
            </Text>
            <Text size="xl" fw={700}>
              {classStats.avgPercentage.toFixed(1)}%
            </Text>
          </Stack>
        </Group>
      </Card>

      {/* Students Table */}
      <Table.ScrollContainer minWidth={rem(800)}>
        <Table
          highlightOnHover
          style={{ borderRadius: rem(8), overflow: 'hidden' }}
          verticalSpacing="lg"
        >
          <Table.Thead>
            <Table.Tr
              style={{
                borderBottom: '1px solid var(--mantine-color-gray-3)',
              }}
              bg="gray.1"
              c="dark.5"
            >
              <Table.Th>Student</Table.Th>
              <Table.Th>Progress</Table.Th>
              <Table.Th>Current Score</Table.Th>
              <Table.Th>Grade Percentage</Table.Th>
              <Table.Th>Trend</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {students.map((student) => {
              const percentage =
                student.totalPossible > 0
                  ? (student.totalScore / student.totalPossible) * 100
                  : 0
              const completionRate =
                student.totalAssignments > 0
                  ? (student.gradedCount / student.totalAssignments) * 100
                  : 0
              const isExpanded = expandedStudents.has(student.studentId)

              return (
                <Fragment key={student.studentId}>
                  <Table.Tr
                    onClick={() => toggleExpand(student.studentId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="transparent" size="sm">
                          {isExpanded ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                        <Box>
                          <Text fw={500}>{student.studentName}</Text>
                          <Text size="xs" c="dimmed">
                            ID: {student.studentId}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} c="dark.5">
                        {completionRate.toFixed(0)}%
                      </Text>
                      <Text size="xs" c="dimmed">
                        {student.gradedCount}/{student.totalAssignments}{' '}
                        completed
                      </Text>
                      <Progress
                        value={completionRate}
                        size="sm"
                        color="blue"
                        mt={4}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>
                        {student.totalScore.toFixed(1)}/
                        {student.totalPossible.toFixed(1)}
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
                    <Table.Td colSpan={5} p={0}>
                      <Collapse in={isExpanded}>
                        <Box bg="gray.0" p="lg">
                          <Text fw={500} size="sm" mb="md">
                            Assignment Details
                          </Text>
                          <Stack gap="xs">
                            {student.assignments.map((assignment) => (
                              <Card
                                key={assignment.contentId}
                                withBorder
                                radius="md"
                              >
                                <Group justify="space-between" align="center">
                                  <Box style={{ flex: 1 }}>
                                    <Text fw={500} size="md">
                                      {assignment.title}
                                    </Text>
                                    <Group gap="xs" mt={4}>
                                      <Text size="xs" c="dimmed">
                                        {assignment.maxScore} points
                                      </Text>
                                      {assignment.dueDate && (
                                        <>
                                          <Text size="xs" c="dimmed">
                                            •
                                          </Text>
                                          <Text size="xs" c="dimmed">
                                            Due:{' '}
                                            {formatTimestampToDateTimeText(
                                              assignment.dueDate,
                                              'by',
                                            )}
                                          </Text>
                                        </>
                                      )}
                                    </Group>
                                    <Badge
                                      size="sm"
                                      variant="dot"
                                      color={
                                        assignment.submission.state === 'GRADED'
                                          ? 'green'
                                          : assignment.submission.state ===
                                              'SUBMITTED'
                                            ? 'blue'
                                            : 'gray'
                                      }
                                      mt={6}
                                    >
                                      {assignment.submission.state}
                                    </Badge>
                                  </Box>

                                  <Group gap="sm">
                                    {assignment.submission.currentGrade ? (
                                      <Box ta="right">
                                        <Text fw={700} size="md">
                                          {
                                            assignment.submission.currentGrade
                                              .finalScore
                                          }{' '}
                                          / {assignment.maxScore}
                                        </Text>
                                        {assignment.submission.currentGrade
                                          .gradedAt && (
                                          <Text size="xs" c="dimmed">
                                            Graded{' '}
                                            {formatTimestampToDateTimeText(
                                              assignment.submission.currentGrade
                                                .gradedAt,
                                            )}
                                          </Text>
                                        )}
                                      </Box>
                                    ) : (
                                      <Text c="dimmed" fw={500} size="md">
                                        - / {assignment.maxScore}
                                      </Text>
                                    )}
                                    {assignment.submission.currentGrade
                                      ?.feedback && (
                                      <Tooltip
                                        label={
                                          assignment.submission.currentGrade
                                            .feedback
                                        }
                                      >
                                        <IconNote size={18} />
                                      </Tooltip>
                                    )}
                                  </Group>
                                </Group>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </Fragment>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  )
}
