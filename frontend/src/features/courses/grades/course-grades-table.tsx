import { Badge, Box, Button, rem, Table, Text, Tooltip } from '@mantine/core'
import { Suspense } from 'react'
import type {
  CourseGradebookForMentor,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SuspendedTableRows from '@/components/suspended-table-rows.tsx'
import { IconNote } from '@tabler/icons-react'

// --- Student View Table ---
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
                  {latestSubmission?.submissionTimestamp
                    ? formatTimestampToDateTimeText(
                        latestSubmission.submissionTimestamp,
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

// --- Mentor View Table ---
const MentorGradesTable = ({
  assignments,
}: {
  assignments: CourseGradebookForMentor['assignments']
}) => (
  <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
    <Table
      highlightOnHover
      highlightOnHoverColor="gray.0"
      style={{ borderRadius: rem('8px'), minWidth: '1000px' }}
    >
      <Table.Thead>
        <Table.Tr bg={'gray.1'} c={'dark.5'}>
          <Table.Th>Assignment</Table.Th>
          <Table.Th>Student</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Submitted At</Table.Th>
          <Table.Th>Grade</Table.Th>
          <Table.Th>Feedback</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Suspense fallback={<SuspendedTableRows columns={7} />}>
          {assignments.flatMap((assignment) =>
            assignment.submissions.map((submission) => (
              <Table.Tr
                key={`${assignment.assignmentId}-${submission.studentId}`}
              >
                <Table.Td>
                  <div>
                    <Text fw={500}>{assignment.assignmentTitle}</Text>
                    <Text size="sm" c="dimmed">
                      {assignment.points} points • Due{' '}
                      {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Text>{submission.studentName}</Text>
                  <Text size="xs" c="dimmed">
                    ID: {submission.studentId}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={submission.submissionStatus}
                    variant="filled"
                    size="sm"
                  >
                    {submission.submissionStatus}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {submission.submissionTimestamp
                    ? formatTimestampToDateTimeText(
                        submission.submissionTimestamp,
                      )
                    : 'Not Submitted'}
                </Table.Td>
                <Table.Td>
                  {submission.grade ? (
                    <div>
                      <Text fw={500}>
                        {submission.grade.score} / {submission.grade.maxScore}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {submission.grade.gradedAt &&
                          `Graded ${formatTimestampToDateTimeText(submission.grade.gradedAt)}`}
                      </Text>
                    </div>
                  ) : (
                    <Text c="dimmed">- / {assignment.points}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {submission.grade?.feedback ? (
                    <Tooltip label={submission.grade.feedback}>
                      <IconNote size={20} color="blue" />
                    </Tooltip>
                  ) : (
                    <IconNote size={20} color="gray" />
                  )}
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => {
                      // Handle grade/edit action
                      console.log(
                        'Grade assignment:',
                        assignment.assignmentId,
                        submission.studentId,
                      )
                    }}
                  >
                    {submission.submissionStatus === 'graded'
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

export { StudentGradesTable, MentorGradesTable }
