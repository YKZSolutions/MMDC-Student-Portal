import { useAuth } from '@/features/auth/auth.hook.ts'
import { Link, useMatchRoute, useNavigate } from '@tanstack/react-router'
import { Button, Select, Stack } from '@mantine/core'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { IconTool } from '@tabler/icons-react'
import { useState } from 'react'

export interface CourseNavItem {
  link: string
  label: string
  fuzzy?: boolean
}

const CourseNavButton = ({ item }: { item: CourseNavItem }) => {
  const matchRoute = useMatchRoute()
  const isActive = matchRoute({ to: item.link, fuzzy: item.fuzzy })

  return (
    <Button
      component={Link}
      variant={isActive ? 'light' : 'subtle'}
      justify="start"
      color={isActive ? undefined : 'gray'}
      to={item.link}
      fullWidth
    >
      {item.label}
    </Button>
  )
}

const CourseNavBar = ({
  navItems,
  courses,
  courseCode,
}: {
  navItems: CourseNavItem[]
  courses: CourseBasicDetails[]
  courseCode: string
}) => {
  const { authUser } = useAuth('protected')
  const currentCourse = courses.find(
    (course) => course.courseCode === courseCode,
  )!
  const getCourseCode = (courseName: string) => {
    return courses.find((course) => course.courseName === courseName)!
      .courseCode
  }
  const [showActions, setShowActions] = useState(false)
  const navigate = useNavigate()

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
            <Button
              bg={'secondary'}
              leftSection={<IconTool size={18} />}
              onClick={() => setShowActions(true)}
            >
              Manage Content
            </Button>
          ),
        }}
      />
      <Select
        data={courses.map((course) => course.courseName)}
        defaultValue={currentCourse.courseName}
        onChange={async (value) => {
          if (value) {
            const newCourseCode = getCourseCode(value)
            const newPath = location.pathname.replace(courseCode, newCourseCode)
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
