import { Button, Stack } from '@mantine/core'
import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  type SectionOption,
} from './course-select-combobox'

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
  sections?: SectionOption[]
  currentSectionId?: string
  onSectionChange?: (id: string) => void
}) {
  return (
    <Stack
      gap={'sm'}
      mt={'md'}
      mr={'md'}
      h={'100vh'}
      style={{ position: 'sticky', top: 0 }}
    >
      {/* WIP: Implement this if sections are available for courses */}
      {/* <CourseSelectCombobox /> */}
      {navItems.map((item, index) => (
        <CourseNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

export default CourseNavBar
