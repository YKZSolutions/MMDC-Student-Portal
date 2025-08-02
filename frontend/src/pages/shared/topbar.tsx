import { ActionIcon, Breadcrumbs, Group, Text } from '@mantine/core'
import {
  IconBell,
  IconChevronRight,
  IconHomeFilled,
  IconMessageChatbot,
} from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'

function Topbar() {
  const location = useLocation()

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

          // Capitalize label
          const label = link.charAt(0).toUpperCase() + link.slice(1)

          return isLast ? (
            <Text key={path} size="sm" className="capitalize">
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
        })}
      </Breadcrumbs>

      <Group>
        <ActionIcon variant="subtle" radius="xl">
          <IconMessageChatbot size={22} />
        </ActionIcon>
        <ActionIcon variant="subtle" radius="xl">
          <IconBell size={22} />
        </ActionIcon>
      </Group>
    </Group>
  )
}

export default Topbar
