import {createFileRoute, Outlet, useLocation, useMatchRoute, useNavigate, useParams,} from '@tanstack/react-router'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import {useAuth} from '@/features/auth/auth.hook.ts'
import {
  Box,
  Group,
  useMantineTheme,
} from '@mantine/core'
import {
  type CourseBasicDetails,
} from '@/features/courses/types.ts'
import CourseNavBar, {
  type CourseNavItem,
} from '@/features/courses/course-navbar.tsx'


export const Route = createFileRoute('/(protected)/courses/$courseCode')({
  component: RouteComponent,
})

const mockCourses: CourseBasicDetails[] = [
  {
      courseCode: 'MO-IT200',
      courseName: 'Web Technology Applications',
  },
  {
      courseCode: 'MO-IT351',
      courseName: 'Data Structures & Algorithms',
  },
  {
      courseCode: 'MO-IT400',
      courseName: 'Capstone 1',
  },
  {
      courseCode: 'MO-IT500',
      courseName: 'Capstone 2',
  },
]

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const courses: CourseBasicDetails[] = mockCourses
  const { courseCode } = useParams({ from: '/(protected)/courses/$courseCode' })

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
    >
      {/* Sub Nav */}
      <Box
        style={{
          width: '175px',
          minWidth: '175px',
          borderRight: `1px solid ${theme.colors.gray[2]}`,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <CourseNavBar
          navItems={authUser.role === 'student' ? studentNavItems : adminNavItems}
          courses={courses} //TODO: use all courses for admin
        />,
      </Box>

      {/* Main Content */}
      <Box
        p="sm"
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
