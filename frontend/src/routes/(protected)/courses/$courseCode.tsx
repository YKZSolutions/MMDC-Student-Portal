import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { Box, Group, useMantineTheme } from '@mantine/core'
import { type CourseBasicDetails } from '@/features/courses/types.ts'
import CourseNavBar, {
  type CourseNavItem,
} from '@/features/courses/course-navbar.tsx'
import { mockCourseBasicDetails } from '@/features/courses/mocks.ts'

export const Route = createFileRoute('/(protected)/courses/$courseCode')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const courses: CourseBasicDetails[] = mockCourseBasicDetails
  const { courseCode } = Route.useParams()

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

  return (
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
        <Outlet />
      </Box>
    </Group>
  )
}
