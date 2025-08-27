import { ActionIcon, Breadcrumbs, Group, Text } from '@mantine/core'
import {
  IconBell,
  IconChevronRight,
  IconHomeFilled,
  IconMessageChatbot,
} from '@tabler/icons-react'
import { Link, useLocation, useParams } from '@tanstack/react-router'
import { mockCourses } from '@/routes/(protected)/courses/$courseCode.tsx'

type TopBarProps = {
  setChatbotOpen: (open: boolean) => void
  setChatbotFabHidden: (hidden: boolean) => void
}

function Topbar({ setChatbotOpen, setChatbotFabHidden }: TopBarProps) {
  const location = useLocation()
  const params = useParams({ strict: false }) as Record<string, string>
  const { courseCode } = params

  // TODO: Replace with actual course data from the backend
  const course = courseCode
    ? mockCourses.find((c) => c.courseCode === courseCode)
    : null

  const paths = location.pathname.split('/').slice(1)
  const pathLinks = paths.map((_, i) => '/' + paths.slice(0, i + 1).join('/'))

  return (
    <Group className="px-4 py-2" justify="space-between" align="center">
      <Breadcrumbs
        c="dimmed"
        separator={<IconChevronRight size={14} color="gray" />}
      >
        <ActionIcon radius="xl" size="sm">
          <IconHomeFilled size={14} />
        </ActionIcon>

        {paths.map((link, idx) => {
          const isLast = idx === paths.length - 1
          const path = pathLinks[idx]

          let label = link.charAt(0).toUpperCase() + link.slice(1)

          // Check if the link matches the courseCode and replace it with the courseName
          if (link === courseCode && course) {
            label = course.courseName
          }

          return <BreadcrumbItem isLast={isLast} path={path} label={label} />
        })}
      </Breadcrumbs>

      <Group>
        <ActionIcon
          variant="subtle"
          radius="xl"
          onClick={() => {
            setChatbotOpen(true)
            setChatbotFabHidden(false)
          }}
        >
          <IconMessageChatbot size={22} />
        </ActionIcon>
        <ActionIcon variant="subtle" radius="xl">
          <IconBell size={22} />
        </ActionIcon>
      </Group>
    </Group>
  )
}

interface BreadcrumbItemProps {
  isLast: boolean
  path: string
  label: string
}

function BreadcrumbItem({ isLast, path, label }: BreadcrumbItemProps) {
  return isLast ? (
    <Text key={path} size="sm" c={'dark.5'} fw="bold" className="capitalize">
      {label}
    </Text>
  ) : (
    <Text
      key={path}
      size="sm"
      component={Link}
      to={path}
      className="capitalize"
      style={{ textDecoration: 'none' }}
    >
      {label}
    </Text>
  )
}

export default Topbar
