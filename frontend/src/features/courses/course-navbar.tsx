import { Button, Stack } from '@mantine/core'
import { Link, useMatchRoute } from '@tanstack/react-router'
import type { FileRoutesByTo } from '@/routeTree.gen'

export interface CourseNavItem {
  link: keyof FileRoutesByTo
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

function CourseNavBar({ navItems }: { navItems: CourseNavItem[] }) {
  return (
    <Stack
      gap={'sm'}
      mt={'md'}
      mr={'md'}
      h={'100vh'}
      style={{ position: 'sticky', top: 0 }}
    >
      {navItems.map((item, index) => (
        <CourseNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

export default CourseNavBar
