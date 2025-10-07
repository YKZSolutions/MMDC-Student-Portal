import {
    appointmentsControllerFindAllOptions,
    billingControllerFindAllOptions,
    curriculumControllerFindAllOptions,
    enrollmentControllerFindActiveEnrollmentOptions,
    lmsControllerFindAllForAdminOptions,
    notificationsControllerGetCountOptions,
    usersControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
    ActionIcon,
    Badge,
    Box,
    Card,
    Container,
    Group,
    Progress,
    rem,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title
} from '@mantine/core'
import {
    IconArrowRight,
    IconBell,
    IconBook,
    IconCalendar,
    IconCashBanknote,
    IconChartBar,
    IconClipboardList,
    IconSchool,
    IconTrendingUp,
    IconUserCheck,
    IconUsers,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense, type ReactNode } from 'react'

function AdminDashboardProvider({
  children,
}: {
  children: (props: {
    userStats: {
      total: number
      active: number
      students: number
      mentors: number
    }
    courseStats: {
      total: number
      published: number
      draft: number
    }
    enrollmentStats: {
      activeEnrollment: {
        id: string
        term: string
        year: string
        status: string
      } | null
      totalEnrolled: number
    }
    billingStats: {
      totalUnpaid: number
      totalPartial: number
      recentBills: Array<{
        id: string
        studentName: string
        amount: number
        status: string
      }>
    }
    appointmentStats: {
      upcoming: number
      recent: Array<{
        id: string
        studentName: string
        date: string
        status: string
      }>
    }
    curriculumStats: {
      total: number
    }
    notificationStats: {
      unread: number
    }
  }) => ReactNode
}) {
  // Fetch all the necessary data
  const { data: usersData } = useSuspenseQuery(
    usersControllerFindAllOptions({
      query: { page: 1 },
    }),
  )

  const { data: coursesData } = useSuspenseQuery(
    lmsControllerFindAllForAdminOptions({
      query: { page: 1 },
    }),
  )

  const { data: enrollmentData } = useSuspenseQuery(
    enrollmentControllerFindActiveEnrollmentOptions(),
  )

  const { data: billingData } = useSuspenseQuery(
    billingControllerFindAllOptions({
      query: { page: 1, },
    }),
  )

  const { data: appointmentsData } = useSuspenseQuery(
    appointmentsControllerFindAllOptions({
      query: { page: 1,  },
    }),
  )

  const { data: curriculumData } = useSuspenseQuery(
    curriculumControllerFindAllOptions(),
  )

  const { data: notificationsCount } = useSuspenseQuery(
    notificationsControllerGetCountOptions(),
  )

  // Process user stats
  const users = usersData.users || []
  const userStats = {
    total: usersData.meta?.totalCount || 0,
    active: users.filter((u) => u.disabledAt === null && u.deletedAt === null)
      .length,
    students: users.filter((u) => u.role === 'student').length,
    mentors: users.filter((u) => u.role === 'mentor').length,
  }

  // Process course stats
  const modules = coursesData.modules || []
  const courseStats = {
    total: modules.length,
    published: modules.filter((m) => m.publishedAt !== null).length,
    draft: modules.filter((m) => m.publishedAt === null).length,
  }

  // Process enrollment stats
  const enrollmentStats = {
    activeEnrollment: enrollmentData
      ? {
          id: enrollmentData.id,
          term: `${enrollmentData.term}`,
          year: `${enrollmentData.startYear}-${enrollmentData.endYear}`,
          status: enrollmentData.status,
        }
      : null,
    totalEnrolled: 0, // TODO: This would need a separate endpoint
  }

  // Process billing stats
  const bills = billingData.bills || []
  const billingStats = {
    totalUnpaid: bills.filter((b) => b.status === 'unpaid').length,
    totalPartial: bills.filter((b) => b.status === 'partial').length,
    recentBills: bills.slice(0, 3).map((b) => ({
      id: b.id,
      studentName: b.payerName,
      amount: parseFloat(b.totalAmount),
      status: b.status,
    })),
  }

  // Process appointment stats
  const appointments = appointmentsData.appointments || []
  const appointmentStats = {
    upcoming: appointments.filter((a) => a.status === 'booked' || a.status === 'approved').length,
    recent: appointments.slice(0, 3).map((a) => ({
      id: a.id,
      studentName: `${a.student.firstName} ${a.student.lastName}`,
      date: a.startAt,
      status: a.status,
    })),
  }

  // Process curriculum stats
  const curriculumStats = {
    total: curriculumData.length,
  }

  // Process notification stats
  const notificationStats = {
    unread: notificationsCount.unread || 0,
  }

  return children({
    userStats,
    courseStats,
    enrollmentStats,
    billingStats,
    appointmentStats,
    curriculumStats,
    notificationStats,
  })
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
  link?: string
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  link,
}: StatCardProps) {
  const CardContent = (
    <Card
      p="lg"
      radius="md"
      withBorder
      className="hover:shadow-md transition-shadow cursor-pointer"
      h="100%"
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs">
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Title order={2} fw={700}>
            {value}
          </Title>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
        <ThemeIcon size={60} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  )

  return link ? <Link to={link}>{CardContent}</Link> : CardContent
}

interface ActivityCardProps {
  title: string
  items: Array<{
    id: string
    label: string
    sublabel?: string
    badge?: {
      text: string
      color: string
    }
  }>
  icon: React.ReactNode
  emptyMessage: string
  link?: string
}

function ActivityCard({
  title,
  items,
  icon,
  emptyMessage,
  link,
}: ActivityCardProps) {
  return (
    <Card p="lg" radius="md" withBorder h="100%">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="blue">
              {icon}
            </ThemeIcon>
            <Title order={4} fw={600}>
              {title}
            </Title>
          </Group>
          {link && (
            <Link to={link}>
              <ActionIcon variant="subtle" color="blue">
                <IconArrowRight size={18} />
              </ActionIcon>
            </Link>
          )}
        </Group>

        {items.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap="sm">
            {items.map((item) => (
              <Box
                key={item.id}
                p="sm"
                style={{
                  borderRadius: rem(8),
                  backgroundColor: 'var(--mantine-color-gray-0)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={4}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {item.label}
                    </Text>
                    {item.sublabel && (
                      <Text size="xs" c="dimmed">
                        {item.sublabel}
                      </Text>
                    )}
                  </Stack>
                  {item.badge && (
                    <Badge
                      size="sm"
                      variant="light"
                      color={item.badge.color}
                      radius="sm"
                    >
                      {item.badge.text}
                    </Badge>
                  )}
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <Container size="xl" w="100%" pb="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={1} fw={700} c="dark.7">
            Dashboard
          </Title>
          <Text c="dimmed" size="lg" fw={500}>
            Welcome back! Here's an overview of your system
          </Text>
        </Box>

        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboardProvider>
            {({
              userStats,
              courseStats,
              enrollmentStats,
              billingStats,
              appointmentStats,
              curriculumStats,
              notificationStats,
            }) => (
              <Stack gap="lg">
                {/* Top Stats Row */}
                <SimpleGrid
                  cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }}
                  spacing="lg"
                >
                  <StatCard
                    title="Total Users"
                    value={userStats.total}
                    subtitle={`${userStats.active} active`}
                    icon={<IconUsers size={28} />}
                    color="blue"
                    link="/users"
                  />
                  <StatCard
                    title="Total Courses"
                    value={courseStats.total}
                    subtitle={`${courseStats.published} published`}
                    icon={<IconBook size={28} />}
                    color="green"
                    link="/lms"
                  />
                  <StatCard
                    title="Unpaid Bills"
                    value={billingStats.totalUnpaid}
                    subtitle={`${billingStats.totalPartial} partial`}
                    icon={<IconCashBanknote size={28} />}
                    color="orange"
                    link="/billing"
                  />
                  <StatCard
                    title="Upcoming Appointments"
                    value={appointmentStats.upcoming}
                    icon={<IconCalendar size={28} />}
                    color="purple"
                    link="/appointment"
                  />
                </SimpleGrid>

                {/* Secondary Stats Row */}
                <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
                  <Card p="md" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon size={32} radius="md" variant="light">
                          <IconUserCheck size={18} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          Students
                        </Text>
                      </Group>
                      <Title order={3}>{userStats.students}</Title>
                    </Stack>
                  </Card>

                  <Card p="md" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon
                          size={32}
                          radius="md"
                          variant="light"
                          color="teal"
                        >
                          <IconTrendingUp size={18} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          Mentors
                        </Text>
                      </Group>
                      <Title order={3}>{userStats.mentors}</Title>
                    </Stack>
                  </Card>

                  <Card p="md" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon
                          size={32}
                          radius="md"
                          variant="light"
                          color="indigo"
                        >
                          <IconSchool size={18} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          Curricula
                        </Text>
                      </Group>
                      <Title order={3}>{curriculumStats.total}</Title>
                    </Stack>
                  </Card>

                  <Card p="md" radius="md" withBorder>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ThemeIcon
                          size={32}
                          radius="md"
                          variant="light"
                          color="red"
                        >
                          <IconBell size={18} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          Unread Notifications
                        </Text>
                      </Group>
                      <Title order={3}>{notificationStats.unread}</Title>
                    </Stack>
                  </Card>
                </SimpleGrid>

                {/* Active Enrollment Section */}
                {enrollmentStats.activeEnrollment && (
                  <Card p="lg" radius="md" withBorder>
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="md">
                        <ThemeIcon
                          size={48}
                          radius="md"
                          variant="light"
                          color="cyan"
                        >
                          <IconClipboardList size={24} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed" fw={500}>
                            Active Enrollment Period
                          </Text>
                          <Title order={3}>
                            Term {enrollmentStats.activeEnrollment.term} •{' '}
                            {enrollmentStats.activeEnrollment.year}
                          </Title>
                          <Badge
                            variant="light"
                            color="green"
                            size="lg"
                            tt="capitalize"
                          >
                            {enrollmentStats.activeEnrollment.status}
                          </Badge>
                        </Stack>
                      </Group>
                      <Link to="/enrollment">
                        <ActionIcon
                          variant="light"
                          color="cyan"
                          size="lg"
                          radius="md"
                        >
                          <IconArrowRight size={20} />
                        </ActionIcon>
                      </Link>
                    </Group>
                  </Card>
                )}

                {/* Course Progress Section */}
                <Card p="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon
                          size={36}
                          radius="md"
                          variant="light"
                          color="violet"
                        >
                          <IconChartBar size={20} />
                        </ThemeIcon>
                        <Title order={4} fw={600}>
                          Course Status Overview
                        </Title>
                      </Group>
                      <Link to="/lms">
                        <ActionIcon variant="subtle" color="violet">
                          <IconArrowRight size={18} />
                        </ActionIcon>
                      </Link>
                    </Group>

                    <Group grow>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            Published
                          </Text>
                          <Text size="sm" fw={600} c="green">
                            {courseStats.published}
                          </Text>
                        </Group>
                        <Progress
                          value={
                            courseStats.total > 0
                              ? (courseStats.published / courseStats.total) *
                                100
                              : 0
                          }
                          color="green"
                          size="md"
                          radius="xl"
                        />
                      </Stack>

                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            Draft
                          </Text>
                          <Text size="sm" fw={600} c="orange">
                            {courseStats.draft}
                          </Text>
                        </Group>
                        <Progress
                          value={
                            courseStats.total > 0
                              ? (courseStats.draft / courseStats.total) * 100
                              : 0
                          }
                          color="orange"
                          size="md"
                          radius="xl"
                        />
                      </Stack>
                    </Group>
                  </Stack>
                </Card>

                {/* Activity Cards Grid */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <ActivityCard
                    title="Recent Bills"
                    icon={<IconCashBanknote size={20} />}
                    items={billingStats.recentBills.map((bill) => ({
                      id: bill.id,
                      label: bill.studentName,
                      sublabel: `₱${bill.amount.toLocaleString()}`,
                      badge: {
                        text: bill.status,
                        color:
                          bill.status === 'paid'
                            ? 'green'
                            : bill.status === 'unpaid'
                              ? 'red'
                              : 'orange',
                      },
                    }))}
                    emptyMessage="No recent bills"
                    link="/billing"
                  />

                  <ActivityCard
                    title="Recent Appointments"
                    icon={<IconCalendar size={20} />}
                    items={appointmentStats.recent.map((apt) => ({
                      id: apt.id,
                      label: apt.studentName,
                      sublabel: dayjs(apt.date).format('MMM DD, YYYY h:mm A'),
                      badge: {
                        text: apt.status,
                        color:
                          apt.status === 'upcoming'
                            ? 'blue'
                            : apt.status === 'finished'
                              ? 'green'
                              : 'gray',
                      },
                    }))}
                    emptyMessage="No recent appointments"
                    link="/appointment"
                  />
                </SimpleGrid>
              </Stack>
            )}
          </AdminDashboardProvider>
        </Suspense>
      </Stack>
    </Container>
  )
}

function DashboardSkeleton() {
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {[...Array(4)].map((_, i) => (
          <Card key={i} p="lg" radius="md" withBorder h={120}>
            <Stack gap="sm">
              <Box h={20} bg="gray.2" style={{ borderRadius: rem(4) }} />
              <Box h={32} bg="gray.2" style={{ borderRadius: rem(4) }} />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default AdminDashboard
