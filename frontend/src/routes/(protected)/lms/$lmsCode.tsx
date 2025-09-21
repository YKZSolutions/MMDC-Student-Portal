import { useAuth } from '@/features/auth/auth.hook.ts'
import CourseNavBar, {
  type CourseNavItem,
} from '@/features/courses/course-navbar.tsx'
import { CourseHeaderSkeleton } from '@/features/courses/suspense'
import type {
  CourseDto,
  CourseSectionWithCourseOfferingDto,
  EnrollmentPeriodDto,
} from '@/integrations/api/client'
import { courseSectionControllerFindOneCourseSectionByIdOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatToSchoolYear } from '@/utils/formatters'
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { IconBookmark, IconTool } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Suspense, useMemo, useState, type ReactNode } from 'react'

export const Route = createFileRoute('/(protected)/lms/$lmsCode')({
  component: RouteComponent,
})

function RouteComponentQueryProvider({
  children,
}: {
  children: (props: {
    data: CourseSectionWithCourseOfferingDto
    course: CourseDto
    enrollmentPeriod: EnrollmentPeriodDto
  }) => ReactNode
}) {
  const { lmsCode } = Route.useParams()

  const { data } = useSuspenseQuery({
    ...courseSectionControllerFindOneCourseSectionByIdOptions({
      path: {
        sectionId: lmsCode,
      },
    }),
  })

  const [enrollmentPeriodId, setEnrollmentPeriodId] = useLocalStorage<
    string | null
  >({
    key: 'enrollmentPeriodId',
  })

  const _enrollmentPeriodId = useMemo(
    () =>
      setEnrollmentPeriodId(data?.courseOffering.enrollmentPeriod.id ?? null),
    [data],
  )

  const course = data?.courseOffering.course
  const enrollmentPeriod = data?.courseOffering.enrollmentPeriod

  return children({
    data,
    course,
    enrollmentPeriod,
  })
}

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()
  const { lmsCode } = Route.useParams()

  const studentNavItems: CourseNavItem[] = [
    {
      link: `/lms/${lmsCode}`,
      label: 'Overview',
      fuzzy: false,
    },
    {
      link: `/lms/${lmsCode}/modules`,
      label: 'Modules',
      fuzzy: true,
    },
    {
      link: `/lms/${lmsCode}/assignments`,
      label: 'Assignments',
      fuzzy: true,
    },
    {
      link: `/lms/${lmsCode}/grades`,
      label: 'Grades',
      fuzzy: true,
    },
  ]

  const adminNavItems: CourseNavItem[] = [
    ...studentNavItems,
    {
      link: `/lms/${lmsCode}/files`,
      label: 'Files',
      fuzzy: true,
    },
    {
      link: `/lms/${lmsCode}/students`,
      label: 'Students',
      fuzzy: true,
    },
    {
      link: `/lms/${lmsCode}/progress`,
      label: 'Progress Report',
      fuzzy: true,
    },
    {
      link: `/lms/${lmsCode}/settings`,
      label: 'Settings',
      fuzzy: true,
    },
  ]

  const [showActions, setShowActions] = useState(false)

  return (
    <Stack w="100%" h="100%" gap={0}>
      <Group wrap={'nowrap'} justify="space-between" align="center" mb={'md'}>
        <Group gap="sm" align="center">
          <ThemeIcon size="lg" variant="light" color="blue">
            <IconBookmark size={20} />
          </ThemeIcon>
          <Suspense fallback={<CourseHeaderSkeleton />}>
            <RouteComponentQueryProvider>
              {({ data, course, enrollmentPeriod }) => (
                <Box>
                  <Title order={3}>{course.name}</Title>
                  <Group gap={'xs'} className="">
                    <Text size="sm" c="dimmed">
                      {course.courseCode}
                    </Text>
                    <Text size="sm" c="dimmed">
                      •
                    </Text>
                    <Text size="sm" c="dimmed">
                      {formatToSchoolYear(
                        enrollmentPeriod.startYear,
                        enrollmentPeriod.endYear,
                      )}
                    </Text>
                    <Text size="sm" c="dimmed">
                      •
                    </Text>
                    <Text size="sm" c="dimmed">
                      Term {enrollmentPeriod.term}
                    </Text>
                    <Text size="sm" c="dimmed">
                      •
                    </Text>
                    <Text size="sm" c="dimmed">
                      {data?.name}
                    </Text>
                  </Group>
                </Box>
              )}
            </RouteComponentQueryProvider>
          </Suspense>
        </Group>
        {authUser.role === 'admin' && (
          <Button
            bg={'secondary'}
            leftSection={<IconTool size={18} />}
            onClick={() => setShowActions(true)}
            size={'sm'}
          >
            Manage Content
          </Button>
        )}
      </Group>
      <Divider />
      <Group
        w="100%"
        h="100%"
        align="stretch"
        style={{
          overflow: 'hidden',
        }}
        gap={0}
      >
        {/* Course Nav */}
        <Box
          style={{
            width: '184px',
            minWidth: '184px',
            borderRight: `1px solid ${theme.colors.gray[2]}`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <CourseNavBar
            navItems={
              authUser.role === 'student' ? studentNavItems : adminNavItems
            }
            courseCode={lmsCode}
          />
        </Box>

        {/* Main Content */}
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            scrollbarGutter: 'stable',
          }}
        >
          <Container size="lg" py="md">
            <Outlet />
          </Container>
        </Box>
      </Group>
    </Stack>
  )
}
