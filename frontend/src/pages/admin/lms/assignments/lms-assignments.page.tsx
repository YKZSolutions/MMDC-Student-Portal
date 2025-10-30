import { assignmentControllerFindAllForAdminOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { AdminAssignmentItemDto } from '@/integrations/api/client/types.gen'
import {
  Badge,
  Box,
  Group,
  Progress,
  rem,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconAlertCircle, IconBook, IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/assignments/')

export default function LMSAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  return (
    <Stack gap="md" p="md">
      <Header />
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || 'all')}
      >
        <Tabs.List>
          <Tabs.Tab value="all" leftSection={<IconBook size={16} />}>
            All Assignments
          </Tabs.Tab>
          <Tabs.Tab
            value="needs-attention"
            leftSection={<IconAlertCircle size={16} />}
          >
            Needs Attention
          </Tabs.Tab>
        </Tabs.List>

        <Box py="md">
          <AssignmentsTable activeTab={activeTab} />
        </Box>
      </Tabs>
    </Stack>
  )
}

function Header() {
  return (
    <Title c="dark.7" order={2} fw={700}>
      Assignments
    </Title>
  )
}

function AssignmentsTable({ activeTab }: { activeTab: string }) {
  const { lmsCode } = route.useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300)

  const { data: paginated } = useSuspenseQuery(
    assignmentControllerFindAllForAdminOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const { assignments } = paginated

  // Filter assignments based on active tab and search
  const filteredAssignments = useMemo(() => {
    if (!assignments) return []

    let filtered = assignments

    // Filter by tab
    if (activeTab === 'needs-attention') {
      filtered = filtered.filter((assignment) => {
        // Needs attention if:
        // 1. Has submissions that need grading (submitted but not graded)
        // 2. Is overdue with missing submissions
        const hasUngraded = assignment.stats.submitted > assignment.stats.graded
        const isOverdue = assignment.dueDate
          ? dayjs().isAfter(dayjs(assignment.dueDate))
          : false
        const hasMissingSubmissions =
          assignment.stats.submitted < assignment.stats.total

        return hasUngraded || (isOverdue && hasMissingSubmissions)
      })
    }

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter((assignment) =>
        assignment.title.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [assignments, activeTab, debouncedSearch])

  return (
    <Stack>
      <TextInput
        placeholder="Search assignments..."
        radius="md"
        leftSection={<IconSearch size={18} stroke={1.5} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

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
              <Table.Th>Status</Table.Th>
              <Table.Th>Completion Rate</Table.Th>
              <Table.Th>Configuration</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredAssignments?.map((assignment) => (
              <AssignmentRow key={assignment.id} assignment={assignment} />
            ))}

            {!filteredAssignments || filteredAssignments.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py="xl">
                    {debouncedSearch.trim()
                      ? 'No assignments match your search'
                      : activeTab === 'needs-attention'
                        ? 'No assignments need attention'
                        : 'No assignments found'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  )
}

function AssignmentRow({ assignment }: { assignment: AdminAssignmentItemDto }) {
  const isOpen = assignment.dueDate
    ? dayjs().isBefore(dayjs(assignment.dueDate))
    : true

  const completionRate =
    assignment.stats.total > 0
      ? ((assignment.stats.submitted / assignment.stats.total) * 100).toFixed(0)
      : 0

  const completionProgress =
    assignment.stats.total > 0
      ? (assignment.stats.submitted / assignment.stats.total) * 100
      : 0

  return (
    <Table.Tr>
      <Table.Td>
        <Box>
          <Text fw={500} c="dark.5">
            {assignment.title}
          </Text>
          <Text size="xs" c="dimmed">
            {assignment.maxScore} points
          </Text>
        </Box>
      </Table.Td>

      <Table.Td>
        {assignment.dueDate ? (
          <Stack gap={0}>
            <Text fw={500} size="sm" c="dark.3">
              {dayjs(assignment.dueDate).format('MMM D, YYYY')}
            </Text>
            <Text fw={500} size="xs" c="dark.1">
              {dayjs(assignment.dueDate).format('h:mm A')}
            </Text>
          </Stack>
        ) : (
          <Text fw={500} size="sm" c="dark.3">
            No due date
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Badge variant="outline" size="sm" color={isOpen ? 'green' : 'red'}>
          {isOpen ? 'Open' : 'Closed'}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text fw={500} c="dark.5">
          {completionRate}%
        </Text>
        <Text size="xs" c="dimmed">
          {assignment.stats.submitted}/{assignment.stats.total} submitted
        </Text>
        <Progress value={completionProgress} color="blue" mt={4} />
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Badge color="blue" variant="dot" size="xs">
            {assignment.mode === 'GROUP' ? 'Group' : 'Individual'}
          </Badge>
          {assignment.maxAttempts && assignment.maxAttempts > 0 && (
            <Badge color="orange" variant="dot" size="xs">
              {assignment.maxAttempts} attempt
              {assignment.maxAttempts > 1 ? 's' : ''}
            </Badge>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  )
}
