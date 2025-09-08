import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
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
import { type EnrolledCourse } from '@/features/courses/types.ts'
import CourseNavBar, {
  type CourseNavItem,
} from '@/features/courses/course-navbar.tsx'
import { mockEnrolledCourse } from '@/features/courses/mocks.ts'
import { IconBookmark, IconTool } from '@tabler/icons-react'
import React, { useState } from 'react'

export const Route = createFileRoute('/(protected)/courses/$courseCode')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const courses: EnrolledCourse[] = mockEnrolledCourse
  const { courseCode } = Route.useParams()
  const course = courses.find((c) => c.courseCode === courseCode)

  const studentNavItems: CourseNavItem[] = [
    {
      link: `/courses/${courseCode}`,
      label: 'Overview',
      fuzzy: false,
    },
    {
      link: `/courses/${courseCode}/modules`,
      label: 'Modules',
      fuzzy: true,
    },
    {
      link: `/courses/${courseCode}/assignments`,
      label: 'Assignments',
      fuzzy: true,
    },
    {
      link: `/courses/${courseCode}/grades`,
      label: 'Grades',
      fuzzy: true,
    },
  ]

  const adminNavItems: CourseNavItem[] = [
    ...studentNavItems,
    {
      link: `/courses/${courseCode}/files`,
      label: 'Files',
      fuzzy: true,
    },
    {
      link: `/courses/${courseCode}/students`,
      label: 'Students',
      fuzzy: true,
    },
    {
      link: `/courses/${courseCode}/progress`,
      label: 'Progress Report',
      fuzzy: true,
    },
    {
      link: `/courses/${courseCode}/settings`,
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
          <div>
            <Title order={3}>{course?.courseName}</Title>
            <Text size="sm" c="dimmed">
              {course?.courseCode} • {course?.program.program} •{' '}
              {course?.section.sectionName}
            </Text>
          </div>
        </Group>
        <Button
          bg={'secondary'}
          leftSection={<IconTool size={18} />}
          onClick={() => setShowActions(true)}
          size={'sm'}
        >
          Manage Content
        </Button>
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
            courses={courses} //TODO: use all courses for admin
            courseCode={courseCode}
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
