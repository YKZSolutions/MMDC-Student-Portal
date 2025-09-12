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
