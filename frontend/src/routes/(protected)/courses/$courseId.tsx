import {
  createFileRoute,
  Outlet,
  useLocation,
  useMatchRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  Container,
  Grid,
  GridCol,
  Stack,
  Text,
    Button,
  Group,
  Box,
  useMantineTheme, Select,
} from '@mantine/core'

export const Route = createFileRoute('/(protected)/courses/$courseId')({
  component: RouteComponent,
})

interface SubNavItem {
    link: string
    label: string
    fuzzy?: boolean
}

const SubNavButton = ({ item }: { item: SubNavItem }) => {
    const matchRoute = useMatchRoute()
    const navigate = useNavigate()

  const isActive = matchRoute({ to: item.link, fuzzy: item.fuzzy })

    return (
        <Button
            variant={isActive ? 'light' : 'subtle'}
            justify="start"
            color={isActive ? undefined : 'gray'}
            onClick={() => navigate({ to: item.link })}
            fullWidth
        >
            {item.label}
        </Button>
    )
}

interface CourseBasicDetails {
  courseId: string
  courseName: string
}

const SubNavBar = ({navItems, courses}: {navItems: SubNavItem[], courses: CourseBasicDetails[]}) => {
  const { courseId } = useParams({ from: '/(protected)/courses/$courseId' })
  const currentCourse = courses.find((course) => course.courseId === courseId)!
  const getCourseId = (courseName: string) => {
    return courses.find((course) => course.courseName === courseName)!.courseId
  }
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Stack
      gap={'sm'}
      mt={'md'}
      mr={'md'}
      h={'100vh'}
      style={{ position: 'sticky', top: 0 }}
    >
      <Select
        data={courses.map((course) => course.courseName)}
        defaultValue={currentCourse.courseName}
        onChange={async (value) => {
          if (value) {
            const newCourseId = getCourseId(value)
            const newPath = location.pathname.replace(courseId, newCourseId)
            await navigate({ to: newPath })
          }
        }}
      />
      {navItems.map((item, index) => (
        <SubNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

const mockCourses: CourseBasicDetails[] = [
    {
        courseId: 'MO-IT200',
        courseName: 'Web Technology Applications',
    },
    {
        courseId: 'MO-IT351',
        courseName: 'Data Structures & Algorithms',
    },
    {
        courseId: 'MO-IT400',
        courseName: 'Capstone 1',
    },
    {
        courseId: 'MO-IT500',
        courseName: 'Capstone 2',
    },
]

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const courses: CourseBasicDetails[] = mockCourses
  const { courseId } = useParams({ from: '/(protected)/courses/$courseId' })

  const studentNavItems: SubNavItem[] = [
    {
      link: `/courses/${courseId}`,
      label: 'Overview',
      fuzzy: false,
    },
    {
      link: `/courses/${courseId}/modules`,
      label: 'Modules',
      fuzzy: true,
    },
    {
      link: `/courses/${courseId}/assignments`,
      label: 'Assignments',
      fuzzy: true,
    },
    {
      link: `/courses/${courseId}/grades`,
      label: 'Grades',
      fuzzy: true,
    }
  ]

  return (
    <Group
      w="100%"
      h="100%"
      gap="sm"
      align="stretch"
      style={{
        overflow: 'hidden'
    }}
    >
      {/* Sub Nav */}
      <Box
        h='100vh'
        miw={"12%"}
        style={{
          borderRight: `1px solid ${theme.colors.gray[2]}`,
          overflow: 'hidden',
      }}>
        <RoleComponentManager
          currentRole={authUser.role}
          roleRender={{
            student: <SubNavBar navItems={studentNavItems} courses={courses}/>,
          }}
        />
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
