import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  useLocation,
  useMatchRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { Button, Select, Stack } from '@mantine/core'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import ButtonWithModal from '@/components/btn-w-modal.tsx'
import CourseActionsSelector from '@/features/courses/course-actions-selector.tsx'
import { IconPlus } from '@tabler/icons-react'

export interface CourseNavItem {
  link: string
  label: string
  fuzzy?: boolean
}

const CourseNavButton = ({ item }: { item: CourseNavItem }) => {
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

const CourseNavBar = ({
  navItems,
  courses,
}: {
  navItems: CourseNavItem[]
  courses: CourseBasicDetails[]
}) => {
  const { authUser } = useAuth('protected')
  const { courseCode } = useParams({ from: '/(protected)/courses/$courseCode' })
  const currentCourse = courses.find(
    (course) => course.courseCode === courseCode,
  )!
  const getCourseCode = (courseName: string) => {
    return courses.find((course) => course.courseName === courseName)!
      .courseCode
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
      {/*TODO: this might be different for different admin roles*/}
      <RoleComponentManager
        currentRole={authUser.role}
        roleRender={{
          admin: (
            <ButtonWithModal
              label={'Create New ...'}
              icon={<IconPlus />}
              modalComponent={CourseActionsSelector}
              mb={'md'}
            />
          ),
        }}
      />
      <Select
        data={courses.map((course) => course.courseName)}
        defaultValue={currentCourse.courseName}
        onChange={async (value) => {
          if (value) {
            const newCourseId = getCourseCode(value)
            const newPath = location.pathname.replace(courseCode, newCourseId)
            await navigate({ to: newPath })
          }
        }}
      />
      {navItems.map((item, index) => (
        <CourseNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

export default CourseNavBar
