import PageHeader from '@/components/page-header'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item'
import { CourseListSuspense } from '@/features/courses/suspense'
import { ViewSelectorButton } from '@/features/lms/components/view-selector-button'
import { useSearchState } from '@/hooks/use-search-state'
import {
  lmsControllerFindAllForAdminOptions,
  lmsControllerFindAllForMentorOptions,
  lmsControllerFindAllForStudentOptions,
  lmsControllerGetModuleProgressOverviewOptions,
  tasksControllerGetAllTasksForStudentOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Container,
  Divider,
  Group,
  rem,
  Stack,
  Text,
  TextInput,
  Card,
  Badge,
  Avatar,
  ActionIcon,
  Skeleton,
} from '@mantine/core'
import {
  IconSearch,
  IconBook,
  IconCalendar,
  IconArrowRight,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Suspense } from 'react'
import dayjs from 'dayjs'

const route = getRouteApi('/(protected)/lms/')

export default function LMSDashboardPage() {
  const {
    authUser: { role },
  } = useAuth('protected')

  return (
    <Container size="lg" w="100%" pb="xl">
      <Stack gap="lg">
        <PageHeader
          title="Learning Management System"
          subtitle="Manage your modules and track your progress"
        />
        <ActionBar />
        <Group align="flex-start" wrap="nowrap" gap="md">
          <Stack
            gap="md"
            style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
          >
            <Group
              wrap="wrap"
              gap="md"
              style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
            >
              <Suspense fallback={<CourseListSuspense />}>
                <RoleComponentManager
                  currentRole={role}
                  roleRender={{
                    admin: <ModuleListAdmin />,
                    student: <ModuleListStudent />,
                    mentor: <ModuleListMentor />,
                  }}
                />
              </Suspense>
            </Group>
          </Stack>
          {role === 'student' && (
            <Suspense fallback={<UpcomingTasksSkeleton />}>
              <UpcomingTasksWidget />
            </Suspense>
          )}
        </Group>
      </Stack>
    </Container>
  )
}

function ActionBar() {
  const { search, setSearch, setDebouncedSearch } = useSearchState(route)

  return (
    <>
      <Group align="center" justify="end" gap={rem(5)}>
        <TextInput
          placeholder="Search courses"
          radius={'md'}
          leftSection={<IconSearch size={18} stroke={1} />}
          w={{
            base: '100%',
            xs: rem(250),
          }}
          onChange={(e) => {
            const searchQuery = e.target.value
            setDebouncedSearch({
              search: searchQuery === '' ? undefined : searchQuery,
            })
          }}
        />
        {/* Implement this at a later time */}
        {/* <CourseDashboardFilters
          filters={filters}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        /> */}
        <ViewSelectorButton
          value={search.vie === undefined ? 'grid' : 'list'}
          onSelect={(value) =>
            setSearch({ vie: value === 'list' ? value : undefined })
          }
        />
      </Group>
      <Divider />
    </>
  )
}

function ModuleListAdmin() {
  const { search } = useSearchState(route)

  const { data: paginated } = useSuspenseQuery(
    lmsControllerFindAllForAdminOptions({
      query: {
        search: search.search || undefined,
        page: search.page || 1,
        enrollmentPeriodId: undefined,
      },
    }),
  )

  const { modules } = paginated

  return modules.map((module) =>
    search.vie === 'list' ? (
      <CourseListRow
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ) : (
      <CourseCard
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ),
  )
}

function ModuleListStudent() {
  const { search } = useSearchState(route)

  const { data: paginated } = useSuspenseQuery(
    lmsControllerFindAllForStudentOptions({
      query: {
        search: search.search || undefined,
        page: search.page || 1,
        enrollmentPeriodId: undefined,
      },
    }),
  )

  const { modules } = paginated

  return modules.map((module) => {
    return search.vie === 'list' ? (
      <CourseListRow
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
        moduleId={module.id}
      />
    ) : (
      <CourseCard
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
        moduleId={module.id}
        currentMeeting={{
          startTime: '8:00AM',
          endTime: '9:00AM',
          meetingLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        }}
        onCalendarClick={() => {
          window.open(
            'https://drive.google.com/drive/folders/1LlrdpfkLptX58UmLprLAyPRigEWWW_JW?usp=drive_link',
            '_blank',
          )
        }}
      />
    )
  })
}

function ModuleListMentor() {
  const { search } = useSearchState(route)

  const { data: paginated } = useSuspenseQuery(
    lmsControllerFindAllForMentorOptions({
      query: {
        search: search.search || undefined,
        page: search.page || 1,
        enrollmentPeriodId: undefined,
      },
    }),
  )

  const { modules } = paginated

  return modules.map((module) =>
    search.vie === 'list' ? (
      <CourseListRow
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ) : (
      <CourseCard
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ),
  )
}

function UpcomingTasksSkeleton() {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ width: 350, position: 'sticky', top: 20 }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Skeleton height={24} width={150} />
          <Skeleton height={30} width={30} circle />
        </Group>
        <Stack gap="sm">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} padding="sm" radius="md" withBorder>
              <Stack gap="xs">
                <Group gap="xs">
                  <Skeleton height={32} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={12} width="60%" />
                  </Stack>
                </Group>
                <Skeleton height={12} width="50%" />
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

function UpcomingTasksWidget() {
  const { data: paginated } = useSuspenseQuery(
    tasksControllerGetAllTasksForStudentOptions({
      query: {
        status: 'upcoming',
        sortBy: 'dueDate',
        page: 1,
        limit: 5,
      },
    }),
  )

  const upcomingTasks = paginated.tasks?.slice(0, 5) || []

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ width: 350, position: 'sticky', top: 20 }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            Upcoming Tasks
          </Text>
          <Link to="/lms/tasks" style={{ textDecoration: 'none' }}>
            <ActionIcon variant="subtle" color="blue" size="lg">
              <IconArrowRight size={20} />
            </ActionIcon>
          </Link>
        </Group>

        {upcomingTasks.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No upcoming tasks
          </Text>
        ) : (
          <Stack gap="sm">
            {upcomingTasks.map((task) => {
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date()

              return (
                <Link
                  key={task.id}
                  to="/lms/$lmsCode/modules/$itemId"
                  params={{
                    lmsCode: task.module.id,
                    itemId: task.moduleContentId,
                  }}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    padding="sm"
                    radius="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:shadow-sm"
                  >
                    <Stack gap="xs">
                      <Group gap="xs" wrap="nowrap">
                        <Avatar color="gray" size="sm" radius="xl">
                          <IconBook size={16} />
                        </Avatar>
                        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            size="sm"
                            fw={500}
                            lineClamp={1}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {task.title}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {task.course.courseCode}
                          </Text>
                        </Stack>
                      </Group>
                      {task.dueDate && (
                        <Group gap="xs">
                          <IconCalendar size={14} stroke={1.5} />
                          <Text size="xs" c={isOverdue ? 'red' : 'dimmed'}>
                            {dayjs(task.dueDate).format('MMM D, h:mm A')}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                </Link>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
