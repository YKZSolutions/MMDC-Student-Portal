import { useAuth } from '@/features/auth/auth.hook.ts'
import CourseNavBar, {
  type CourseNavItem,
} from '@/features/courses/course-navbar.tsx'
import { Box, Container, Group, useMantineTheme } from '@mantine/core'
import { Outlet } from '@tanstack/react-router'

export function LMSNavigationLayout() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const studentNavItems: CourseNavItem[] = [
    {
      link: `/lms/$lmsCode`,
      label: 'Overview',
      fuzzy: false,
    },
    {
      link: `/lms/$lmsCode/modules`,
      label: 'Modules',
      fuzzy: true,
    },
    {
      link: `/lms/$lmsCode/assignments`,
      label: 'Assignments',
      fuzzy: true,
    },
    {
      link: `/lms/$lmsCode/grades`,
      label: 'Grades',
      fuzzy: true,
    },
  ]

  const adminNavItems: CourseNavItem[] = [
    ...studentNavItems,
    {
      link: `/lms/$lmsCode/overview`,
      label: 'Files',
      fuzzy: true,
    },
    {
      link: `/lms/$lmsCode/overview`,
      label: 'Students',
      fuzzy: true,
    },
    {
      link: `/lms/$lmsCode/overview`,
      label: 'Progress Report',
      fuzzy: true,
    },
    {
      link: `/lms/$lmsCode/overview`,
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
  )
}
