import {
  ActionIcon,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Group,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  IconBell,
  IconBellRinging2,
  IconChevronRight,
  IconHomeFilled,
  IconMessageChatbot,
  IconMessageCheck,
} from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { Fragment } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { EmptyState } from '@/components/empty-state'
import { useNotificationQuery } from '@/features/notification/use-notification-query'
import NotificationItemCard from '@/features/notification/notification-item-card'

type TopBarProps = {
  setChatbotOpen: (open: boolean) => void
  setChatbotFabHidden: (hidden: boolean) => void
}

function Topbar({ setChatbotOpen, setChatbotFabHidden }: TopBarProps) {
  const location = useLocation()

  const paths = location.pathname.split('/').slice(1)
  const pathLinks = paths.map((_, i) => '/' + paths.slice(0, i + 1).join('/'))

  return (
    <Group
      className="px-4 py-2"
      w={'100%'}
      justify="space-between"
      align="center"
      grow
    >
      <Breadcrumbs
        c="dimmed"
        separator={<IconChevronRight size={14} color="gray" />}
        className="flex-nowrap hidden xs:flex"
      >
        <ActionIcon radius="xl" size="sm">
          <IconHomeFilled size={14} />
        </ActionIcon>

        {paths.map((link, idx) => {
          const isLast = idx === paths.length - 1
          const path = pathLinks[idx]

          const label = link.charAt(0).toUpperCase() + link.slice(1)

          return <BreadcrumbItem isLast={isLast} path={path} label={label} />
        })}
      </Breadcrumbs>

      <Group justify="end" mr="lg" className="ml-auto xs:ml-0">
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

        <NotificationAction />
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
    <Text
      key={path}
      size="sm"
      c={'dark.5'}
      fw="bold"
      className="capitalize truncate"
      title={label}
      maw={100}
    >
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
      lineClamp={1}
      maw={100}
    >
      {label}
    </Text>
  )
}

function NotificationAction() {
  const [opened, { close, open }] = useDisclosure(false)

  const { paginated, count, markAllAsRead } = useNotificationQuery()

  // FIX #1: Destructure safely with default values
  // This prevents the app from crashing if 'paginated' is undefined
  const { notifications = [], meta } = paginated ?? {}
  const unread = count?.unread ?? 0

  return (
    <Popover
      width={400}
      shadow="md"
      position="bottom-end"
      opened={opened}
      onDismiss={close}
    >
      <Indicator
        label={<Text size="10">{unread}</Text>}
        size={16}
        disabled={unread === 0}
      >
        <Popover.Target>
          <ActionIcon variant="subtle" radius="xl" onClick={open}>
            <IconBell size={22} />
          </ActionIcon>
        </Popover.Target>
      </Indicator>

      <Popover.Dropdown p={0}>
        <Stack gap={0}>
          <Group px="sm" py="sm" justify="space-between">
            <Text fw={500} size="lg">
              Notifications
            </Text>

            <Tooltip label="Mark All as Read">
              <ActionIcon
                variant="subtle"
                radius="xl"
                disabled={unread === 0}
                onClick={() => markAllAsRead({})}
              >
                <IconMessageCheck size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Divider />

          {/* FIX #2: Use optional chaining and a fallback for the count */}
          {/* This ensures 'totalCount' is never read from an undefined object */}
          {(meta?.totalCount ?? 0) === 0 ? (
            <EmptyState
              icon={<IconBellRinging2 size={48} stroke={1.5} />}
              title="No Notifications"
              description="You currently have no notifications right now"
            />
          ) : (
            <ScrollArea h={250}>
              {notifications.slice(0, 5).map((notification) => (
                <Fragment key={notification.id}>
                  <NotificationItemCard
                    title={notification.title}
                    content={notification.content}
                    date={notification.createdAt}
                    unread={!notification.isRead}
                  />
                  <Divider opacity={0.3} />
                </Fragment>
              ))}
            </ScrollArea>
          )}

          <Divider />

          <Group>
            <Button
              component={Link}
              to="/notifications"
              h={44}
              variant="subtle"
              fullWidth
              className=" rounded-t-none"
              onClick={close}
            >
              View All
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export default Topbar