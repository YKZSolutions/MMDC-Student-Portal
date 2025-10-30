import { assignmentControllerFindAllForStudentOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Avatar,
  Badge,
  Card,
  Group,
  rem,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Select,
} from '@mantine/core'
import {
  IconBook,
  IconHistory,
  IconSearch,
  IconSend,
  IconSortAscending,
  IconCheck,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/assignments/')

const TABS = [
  {
    value: 'all',
    label: 'All',
    icon: <IconHistory size={12} />,
  },
  { value: 'todo', label: 'To Do', icon: <IconSend size={12} /> },
  {
    value: 'submitted',
    label: 'Submitted',
    icon: <IconBook size={12} />,
  },
  {
    value: 'graded',
    label: 'Graded',
    icon: <IconCheck size={12} />,
  },
]

export default function LMSAssignmentsStudentPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].value)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('dueDate')

  return (
    <Stack gap="md" p="md">
      <Title c="dark.7" order={2} fw={700}>
        Assignments
      </Title>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value!)}>
        <Tabs.List>
          {TABS.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={tab.icon}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Stack gap="md" py="md">
          <Group gap="md">
            <TextInput
              placeholder="Search assignments..."
              radius="md"
              leftSection={<IconSearch size={18} stroke={1} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />

            <Select
              placeholder="Sort by"
              radius="md"
              leftSection={<IconSortAscending size={18} />}
              value={sortBy}
              onChange={(value) => setSortBy(value || 'dueDate')}
              data={[
                { value: 'dueDate', label: 'Due Date' },
                { value: 'title', label: 'Title' },
                { value: 'points', label: 'Points' },
                { value: 'status', label: 'Status' },
              ]}
              w={200}
            />
          </Group>

          <AssignmentsList
            activeTab={activeTab}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        </Stack>
      </Tabs>
    </Stack>
  )
}

function AssignmentsList({
  activeTab,
  searchQuery,
  sortBy,
}: {
  activeTab: string
  searchQuery: string
  sortBy: string
}) {
  const { lmsCode } = route.useParams()

  const { data: paginated } = useSuspenseQuery(
    assignmentControllerFindAllForStudentOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const { assignments } = paginated

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments || []

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((assignment) =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab === 'todo') {
      filtered = filtered.filter(
        (assignment) => assignment.submissions.length === 0,
      )
    } else if (activeTab === 'submitted') {
      filtered = filtered.filter(
        (assignment) =>
          assignment.submissions.length > 0 &&
          (assignment.submissions[0].grade === null ||
            assignment.submissions[0].grade === undefined),
      )
    } else if (activeTab === 'graded') {
      filtered = filtered.filter(
        (assignment) =>
          assignment.submissions.length > 0 &&
          assignment.submissions[0].grade !== null &&
          assignment.submissions[0].grade !== undefined,
      )
    }

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date (null dates last)
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()

        case 'title':
          return a.title.localeCompare(b.title)

        case 'points':
          return b.maxScore - a.maxScore

        case 'status':
          // Order: Not Submitted -> Submitted -> Graded
          const getStatusOrder = (assignment: typeof a) => {
            const submitted = assignment.submissions.length > 0
            const graded =
              submitted &&
              assignment.submissions[0].grade !== null &&
              assignment.submissions[0].grade !== undefined
            if (graded) return 2
            if (submitted) return 1
            return 0
          }
          return getStatusOrder(a) - getStatusOrder(b)

        default:
          return 0
      }
    })

    return filtered
  }, [assignments, activeTab, searchQuery, sortBy])

  if (filteredAssignments.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No assignments found
      </Text>
    )
  }

  return (
    <Stack gap="md">
      {filteredAssignments.map((assignment) => {
        const submitted = assignment.submissions.length > 0
        const graded =
          submitted &&
          assignment.submissions[0].grade !== null &&
          assignment.submissions[0].grade !== undefined
        const isOverdue =
          assignment.dueDate && new Date(assignment.dueDate) < new Date()

        return (
          <Link
            key={assignment.id}
            from="/lms/$lmsCode/assignments"
            to="/lms/$lmsCode/modules/$itemId"
            params={{
              lmsCode,
              itemId: assignment.moduleContentId,
            }}
            style={{ textDecoration: 'none' }}
          >
            <Card
              withBorder
              radius="md"
              p="lg"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                  <Avatar
                    radius="md"
                    color={graded ? 'green' : submitted ? 'blue' : 'gray'}
                  >
                    <IconBook size={18} />
                  </Avatar>

                  <Stack gap={rem(5)} flex={1}>
                    <Group align="center" wrap="nowrap">
                      <Title order={5} fw={600} style={{ flex: 1 }}>
                        {assignment.title}
                      </Title>
                      <Group gap="xs">
                        {graded ? (
                          <>
                            <Badge color="green" variant="filled" size="sm">
                              Graded
                            </Badge>
                            {assignment.submissions[0].grade && (
                              <Badge color="primary" variant="filled" size="lg">
                                <Text fw={700} size="md">
                                  {assignment.submissions[0].grade.finalScore}/
                                  {assignment.maxScore}
                                </Text>
                              </Badge>
                            )}
                          </>
                        ) : submitted ? (
                          <Badge color="primary" variant="filled" size="sm">
                            Submitted
                          </Badge>
                        ) : isOverdue ? (
                          <Badge color="red" variant="filled" size="sm">
                            Overdue
                          </Badge>
                        ) : (
                          <Badge color="gray" variant="light" size="sm">
                            Not Submitted
                          </Badge>
                        )}
                      </Group>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2}>
                      Assignment • {assignment.maxScore} points
                    </Text>

                    <Group gap="sm">
                      {submitted && assignment.submissions[0].submittedAt ? (
                        <Text size="sm" fw={600} c="dimmed">
                          Submitted:{' '}
                          {dayjs(assignment.submissions[0].submittedAt).format(
                            'MMM D [at] h:mm A',
                          )}
                        </Text>
                      ) : assignment.dueDate ? (
                        <Text
                          size="sm"
                          fw={600}
                          c={isOverdue ? 'red' : 'dimmed'}
                        >
                          Due:{' '}
                          {dayjs(assignment.dueDate).format(
                            'MMM D [at] h:mm A',
                          )}
                          {isOverdue && ' (Overdue)'}
                        </Text>
                      ) : (
                        <Text size="sm" fw={600} c="dimmed">
                          No due date
                        </Text>
                      )}
                    </Group>
                  </Stack>
                </Group>
              </Group>
            </Card>
          </Link>
        )
      })}
    </Stack>
  )
}
