import {
  billingControllerFindAllOptions,
  courseEnrollmentControllerFindAllOptions,
  enrollmentControllerFindActiveEnrollmentOptions,
  lmsControllerFindAllForAdminOptions,
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
  Title,
} from '@mantine/core'
import {
  IconArrowRight,
  IconBook,
  IconCashBanknote,
  IconChartBar,
  IconClipboardList,
  IconUsers,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Suspense, type ReactNode } from 'react'

type AdminDashboardProviderProps = {
  userStats: {
    total: number
    active: number
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
    recentEnrollments: Array<{
      id: string
      studentName: string
      courseTitle: string
      sectionName: string
      status: string
    }>
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
}

function AdminDashboardProvider({
  children,
}: {
  children: (props: AdminDashboardProviderProps) => ReactNode
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
      query: { page: 1 },
    }),
  )

  const { data: enrollmentFeedData } = useSuspenseQuery(
    courseEnrollmentControllerFindAllOptions({
      query: { page: 1 },
    }),
  )

  // Process user stats
  const users = usersData.users || []
  const userStats = {
    total: usersData.meta?.totalCount || 0,
    active: users.filter((u) => u.disabledAt === null && u.deletedAt === null)
      .length,
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

    recentEnrollments: (enrollmentFeedData?.enrollments || [])
      .slice(0, 3)
      .map((enrollment) => ({
        id: enrollment.id,
        studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        courseTitle: enrollment.courseOffering?.course.name || 'N/A',
        sectionName: enrollment.courseSection?.name || 'N/A',
        status: enrollment.status,
      })),
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

  return children({
    userStats,
    courseStats,
    enrollmentStats,
    billingStats,
  })
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
            {({ userStats, courseStats, enrollmentStats, billingStats }) => (
              <Stack gap="lg">
                {/* Top Stats Row */}
                <SimpleGrid
                  cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3 }}
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
                </SimpleGrid>

                <SimpleGrid
                  cols={{ base: 1, xs: 1, sm: 1, md: 1, lg: 2 }}
                  spacing="lg"
                >
                  {/* Active Enrollment Section */}
                  {enrollmentStats.activeEnrollment && (
                    <Card
                      component={Link}
                      to="/enrollment"
                      p="lg"
                      radius="md"
                      withBorder
                      className="transition-all hover:scale-102 cursor-pointer"
                    >
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
                        <ActionIcon
                          variant="light"
                          color="cyan"
                          size="lg"
                          radius="md"
                        >
                          <IconArrowRight size={20} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  )}

                  {/* Course Progress Section */}
                  <Card
                    component={Link}
                    to="/lms"
                    className="transition-all hover:scale-102 cursor-pointer"
                    p="lg"
                    radius="md"
                    withBorder
                  >
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
                        <ActionIcon variant="subtle" color="violet">
                          <IconArrowRight size={18} />
                        </ActionIcon>
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
                </SimpleGrid>

                {/* Activity Cards Grid */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <BillsCard
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
                  />

                  <EnrollmentCard
                    title="Recent Enrollments"
                    enrollments={enrollmentStats.recentEnrollments}
                    emptyMessage="No recent enrollments"
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
      className="hover:scale-102 transition-all cursor-pointer"
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

interface BillsCardProps {
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
}

function BillsCard({ title, items, icon, emptyMessage }: BillsCardProps) {
  return (
    <Card
      component={Link}
      className="transition-all hover:scale-102 cursor-pointer"
      to="/billing"
      p="lg"
      radius="md"
      withBorder
      h="100%"
    >
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
          <ActionIcon variant="subtle" color="blue">
            <IconArrowRight size={18} />
          </ActionIcon>
        </Group>

        {items.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap="sm">
            {items.map((item) => (
              <Card key={item.id} p="md" radius={'md'} bg={'gray.0'} withBorder>
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
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

interface EnrollmentCardProps {
  title: string
  enrollments: Array<{
    id: string
    studentName: string
    courseTitle: string
    sectionName: string
    status: string
  }>
  emptyMessage: string
}

function EnrollmentCard({
  title,
  enrollments,
  emptyMessage,
}: EnrollmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized':
        return 'green'
      case 'enlisted':
        return 'blue'
      case 'dropped':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <Card
      component={Link}
      to="/enrollment"
      className="transition-all hover:scale-102 cursor-pointer"
      p="lg"
      radius="md"
      withBorder
      h="100%"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="indigo">
              <IconClipboardList size={20} />
            </ThemeIcon>
            <Title order={4} fw={600}>
              {title}
            </Title>
          </Group>
          <ActionIcon variant="subtle" color="indigo">
            <IconArrowRight size={18} />
          </ActionIcon>
        </Group>

        {enrollments.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap="xs">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                p="md"
                radius={'md'}
                bg={'gray.0'}
                withBorder
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={rem(3)}>
                      <Text size="sm" fw={600} c="dark.7">
                        {enrollment.studentName}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {enrollment.courseTitle}
                      </Text>
                      <Text size="xs" c="gray.6" fw={500}>
                        {enrollment.sectionName}
                      </Text>
                    </Stack>
                    <Badge
                      size="sm"
                      variant="light"
                      color={getStatusColor(enrollment.status)}
                      radius="sm"
                      tt="capitalize"
                    >
                      {enrollment.status}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
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
