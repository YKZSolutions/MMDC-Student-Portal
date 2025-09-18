import { Button, Stack } from '@mantine/core'
import { Link, useMatchRoute } from '@tanstack/react-router'

export interface CourseNavItem {
  link: string
  label: string
  fuzzy?: boolean
}

function CourseNavButton({ item }: { item: CourseNavItem }) {
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

function CourseNavBar({
  navItems,
  courseCode,
}: {
  navItems: CourseNavItem[]
  courseCode: string
}) {
  return (
    <Stack
      gap={'sm'}
      mt={'md'}
      mr={'md'}
      h={'100vh'}
      style={{ position: 'sticky', top: 0 }}
    >
      {/* TODO: Implement this later on. For now, this is a nice-to-have */}
      {/* <Select
        data={data.courses.map((course) => course.name)}
        defaultValue={sectionId}
        onChange={async (value) => {
          if (value) {
            const newCourseCode = getCourseCode(value)
            const newPath = location.pathname.replace(sectionId, newCourseCode)
            await navigate({ to: newPath })
          }
        }}
      /> */}
      {navItems.map((item, index) => (
        <CourseNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

export default CourseNavBar
