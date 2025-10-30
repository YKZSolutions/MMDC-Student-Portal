import { tasksControllerGetAllTasksForStudentOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
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
  Loader,
  Center,
  Skeleton,
  Container,
  ActionIcon,
} from '@mantine/core'
import {
  IconBook,
  IconHistory,
  IconSearch,
  IconSend,
  IconSortAscending,
  IconCheck,
  IconCalendar,
  IconTrophy,
  IconArrowLeft,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, Suspense, useEffect } from 'react'
import type { AllTaskItemDto } from '@/integrations/api/client'
import { useSearchState } from '@/hooks/use-search-state'
import Decimal from 'decimal.js'
import PageHeader from '@/components/page-header'
import { useInputState } from '@mantine/hooks'

const route = getRouteApi('/(protected)/lms/tasks/')

const TABS = [
  {
    value: 'all',
    label: 'All',
    icon: <IconHistory size={12} />,
  },
  { value: 'upcoming', label: 'Upcoming', icon: <IconSend size={12} /> },
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

const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'title', label: 'Title' },
  { value: 'course', label: 'Course' },
  { value: 'status', label: 'Status' },
]

// Skeleton loader for task cards
function TaskCardSkeleton() {
  return (
    <Card shadow="xs" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header skeleton */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Skeleton height={40} circle />
            <Stack gap={4}>
              <Skeleton height={20} width={200} />
              <Skeleton height={14} width={150} />
            </Stack>
          </Group>
          <Skeleton height={24} width={80} radius="xl" />
        </Group>

        {/* Subtitle skeleton */}
        <Skeleton height={16} width="80%" />

        {/* Details skeleton */}
        <Group gap="xl">
          <Skeleton height={16} width={180} />
          <Skeleton height={16} width={120} />
        </Group>
      </Stack>
    </Card>
  )
}

// Skeleton loader for the filters
function FiltersLoadingSkeleton() {
  return (
    <Group gap="md">
      <Skeleton height={36} style={{ flex: 1 }} radius="md" />
      <Skeleton height={36} width={250} radius="md" />
      <Skeleton height={36} width={200} radius="md" />
    </Group>
  )
}

// Skeleton loader for the entire tasks list
function TasksListSkeleton() {
  return (
    <Stack gap="md">
      {Array.from({ length: 4 }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </Stack>
  )
}

export default function TasksPage() {
  const { search, setSearch } = useSearchState(route)
  const { tab, search: searchQuery, sortBy, courseId } = search

  return (
    <Container size="md" w="100%" pb="xl">
      <Stack gap="md" p="md">
        <Group gap="xs">
          <Link to="/lms" style={{ textDecoration: 'none' }}>
            <ActionIcon variant="subtle" size="lg" color="gray">
              <IconArrowLeft size={20} />
            </ActionIcon>
          </Link>
          <PageHeader
            title="All Tasks"
            subtitle="View and manage all your assignments and tasks across all enrolled
              courses"
          />
        </Group>

        <Tabs
          value={tab || 'all'}
          onChange={(value) =>
            setSearch(
              {
                tab: value as 'all' | 'upcoming' | 'submitted' | 'graded',
              },
              true,
            )
          }
        >
          <Tabs.List>
            {TABS.map((tabItem) => (
              <Tabs.Tab
                key={tabItem.value}
                value={tabItem.value}
                leftSection={tabItem.icon}
              >
                {tabItem.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Stack gap="md" py="md">
            <Suspense fallback={<FiltersLoadingSkeleton />}>
              <TasksFilters />
            </Suspense>

            <Suspense fallback={<TasksListSkeleton />}>
              <TasksList />
            </Suspense>
          </Stack>
        </Tabs>
      </Stack>
    </Container>
  )
}

function TasksFilters() {
  const { search, setSearch, setDebouncedSearch } = useSearchState(route)
  const [searchInput, setSearchInput] = useInputState(search.search || '')

  // Sync local input state with URL search param when it changes externally
  useEffect(() => {
    setSearchInput(search.search || '')
  }, [search.search])

  // Handle input change: update local state immediately and debounce URL update
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    setSearchInput(value)
    setDebouncedSearch({ search: value }, true)
  }

  // Fetch all tasks to get unique courses for the filter
  const { data: paginated } = useSuspenseQuery(
    tasksControllerGetAllTasksForStudentOptions({
      query: {},
    }),
  )

  const courses = useMemo(() => {
    const uniqueCourses = new Map<
      string,
      { id: string; name: string; courseCode: string }
    >()
    paginated.tasks?.forEach((task) => {
      if (!uniqueCourses.has(task.course.id)) {
        uniqueCourses.set(task.course.id, {
          id: task.course.id,
          name: task.course.name,
          courseCode: task.course.courseCode,
        })
      }
    })
    return Array.from(uniqueCourses.values())
  }, [paginated.tasks])

  const courseOptions = [
    { value: 'all', label: 'All Courses' },
    ...courses.map((course) => ({
      value: course.id,
      label: `${course.courseCode} - ${course.name}`,
    })),
  ]

  return (
    <Group gap="md">
      <TextInput
        placeholder="Search tasks..."
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
        value={searchInput}
        onChange={handleSearchChange}
        style={{ flex: 1 }}
      />

      <Select
        placeholder="Filter by course"
        radius="md"
        value={search.courseId || 'all'}
        onChange={(value) =>
          setSearch(
            {
              courseId: value === 'all' || value === null ? undefined : value,
            },
            true,
          )
        }
        data={courseOptions}
        w={250}
        clearable
      />

      <Select
        placeholder="Sort by"
        radius="md"
        leftSection={<IconSortAscending size={18} />}
        value={search.sortBy || 'dueDate'}
        onChange={(value) =>
          setSearch({ sortBy: (value as any) || 'dueDate' }, true)
        }
        data={SORT_OPTIONS}
        w={200}
      />
    </Group>
  )
}

function TasksList() {
  const { search } = useSearchState(route)

  // Build query params based on filters
  const queryParams = useMemo(() => {
    const params: any = {}

    if (search.tab !== 'all') {
      params.status = search.tab as 'upcoming' | 'submitted' | 'graded'
    }

    if (search.courseId) {
      params.courseId = search.courseId
    }

    if (search.sortBy) {
      params.sortBy = search.sortBy as 'dueDate' | 'title' | 'course' | 'status'
      params.sortDirection = search.sortDirection || 'asc'
    }

    return params
  }, [search.tab, search.courseId, search.sortBy, search.sortDirection])

  const { data: paginated } = useSuspenseQuery(
    tasksControllerGetAllTasksForStudentOptions({
      query: queryParams,
    }),
  )

  // Client-side filtering for search query
  const filteredTasks = useMemo(() => {
    let tasks = paginated.tasks || []

    if (search.search) {
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.search!.toLowerCase()) ||
          task.course.name
            .toLowerCase()
            .includes(search.search!.toLowerCase()) ||
          task.course.courseCode
            .toLowerCase()
            .includes(search.search!.toLowerCase()),
      )
    }

    return tasks
  }, [paginated.tasks, search.search])

  if (filteredTasks.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No tasks found
      </Text>
    )
  }

  return (
    <Stack gap="md">
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </Stack>
  )
}

function TaskCard({ task }: { task: AllTaskItemDto }) {
  const hasSubmissions = task.submissions.length > 0
  const submission = hasSubmissions ? task.submissions[0] : null
  const isGraded = submission?.grade !== null && submission?.grade !== undefined
  const isSubmitted = hasSubmissions && !isGraded
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  // Determine status badge and avatar color
  let statusBadge: { color: string; label: string } | null = null
  let avatarColor = 'gray'

  if (isGraded) {
    statusBadge = { color: 'green', label: 'Graded' }
    avatarColor = 'green'
  } else if (isSubmitted) {
    statusBadge = { color: 'blue', label: 'Submitted' }
    avatarColor = 'blue'
  } else if (isOverdue) {
    statusBadge = { color: 'red', label: 'Overdue' }
    avatarColor = 'gray'
  } else {
    statusBadge = { color: 'yellow', label: 'Upcoming' }
    avatarColor = 'gray'
  }

  return (
    <Link
      to="/lms/$lmsCode/modules/$itemId"
      params={{
        lmsCode: task.module.id,
        itemId: task.moduleContentId,
      }}
      style={{ textDecoration: 'none' }}
    >
      <Card
        shadow="xs"
        padding="lg"
        radius="md"
        withBorder
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        className="hover:shadow-md"
      >
        <Stack gap="sm">
          {/* Header */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Avatar color={avatarColor} radius="xl">
                <IconBook size={20} />
              </Avatar>
              <Stack gap={0}>
                <Text fw={600} size="md" lineClamp={1}>
                  {task.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {task.course.courseCode} - {task.course.name}
                </Text>
              </Stack>
            </Group>

            <Badge color={statusBadge.color} variant="light">
              {statusBadge.label}
            </Badge>
          </Group>

          {/* Subtitle if exists */}
          {task.subtitle && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {task.subtitle}
            </Text>
          )}

          {/* Task Details */}
          <Group gap="xl">
            {task.dueDate && (
              <Group gap="xs">
                <IconCalendar size={16} stroke={1.5} />
                <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
                  Due: {dayjs(task.dueDate).format('MMM D, YYYY h:mm A')}
                </Text>
              </Group>
            )}

            {task.maxScore > 0 && (
              <Group gap="xs">
                <IconTrophy size={16} stroke={1.5} />
                <Text size="sm" c="dimmed">
                  {task.maxScore} points
                  {task.weightPercentage > 0 && ` (${task.weightPercentage}%)`}
                </Text>
              </Group>
            )}
          </Group>

          {/* Grade if available */}
          {isGraded && submission?.grade && (
            <Group gap="xs">
              <Text size="sm" fw={600}>
                Grade:
              </Text>
              <Text size="sm" c="green">
                {new Decimal(submission.grade.finalScore)
                  .div(task.maxScore)
                  .mul(100)
                  .toString()}
                % ({submission.grade.finalScore}/{task.maxScore})
              </Text>
            </Group>
          )}

          {/* Submission info */}
          {hasSubmissions && (
            <Text size="xs" c="dimmed">
              Submitted:{' '}
              {dayjs(submission?.submittedAt).format('MMM D, YYYY h:mm A')}
              {submission?.lateDays && submission.lateDays > 0 && (
                <Text component="span" c="red" ml="xs">
                  ({submission.lateDays} day{submission.lateDays > 1 ? 's' : ''}{' '}
                  late)
                </Text>
              )}
            </Text>
          )}
        </Stack>
      </Card>
    </Link>
  )
}
