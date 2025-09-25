import NotificationItemCard from '@/features/notification/notification-item-card'
import NotificationItemSkeleton from '@/features/notification/notification-item-skeleton'
import { useNotificationQuery } from '@/features/notification/use-notification-query'
import {
  ActionIcon,
  Box,
  Container,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconMessageCheck } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Fragment } from 'react/jsx-runtime'

const route = getRouteApi('/(protected)/notifications/')

function NotificationPage() {
  const { type } = route.useSearch()

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Stack gap={'xl'}>
        <Group justify="space-between" align="start">
          <Box>
            <Title c={'dark.7'} order={2} fw={700}>
              Notifications
            </Title>
            <Text c={'dark.3'} fw={500}>
              See all of your recent notifications here.
            </Text>
          </Box>
        </Group>

        <Stack gap={0}>
          <Suspense
            fallback={
              <Group flex={1} justify="space-between">
                <Tabs mb={4} flex={1} value={type || 'all'}>
                  <Tabs.List>
                    <Tabs.Tab value="all" px="xl" disabled>
                      All
                    </Tabs.Tab>
                    <Tabs.Tab value="unread" px="xl" disabled>
                      Unread
                    </Tabs.Tab>
                    <Tabs.Tab value="read" px="xl" disabled>
                      Read
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>

                <Tooltip label="Mark All as Read">
                  <ActionIcon variant="subtle" radius="xl" disabled>
                    <IconMessageCheck size={22} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
          >
            <NotificationAction />
          </Suspense>
          {/* <Divider my={8} /> */}
          <Suspense
            fallback={Array(5)
              .fill('')
              .map((_, idx) => (
                <Fragment key={idx}>
                  <NotificationItemSkeleton fullContent />
                  <Divider opacity={0.3} />
                </Fragment>
              ))}
          >
            <NotificationList />
          </Suspense>
        </Stack>
      </Stack>
    </Container>
  )
}

function NotificationAction() {
  const { type } = route.useSearch()
  const navigate = route.useNavigate()

  const { count, markAllAsRead } = useNotificationQuery({ query: { type } })

  const unread = count.unread

  return (
    <Group flex={1} justify="space-between">
      <Tabs
        mb={4}
        // w="50%"
        flex={1}
        value={type || 'all'}
        onChange={(val) => {
          const type = val as 'all' | 'read' | 'unread' | null

          navigate({
            search: (prev) => ({
              ...prev,
              type: type !== null && type !== 'all' ? type : undefined,
            }),
          })
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="all" px="xl">
            All
          </Tabs.Tab>
          <Tabs.Tab value="unread" px="xl">
            Unread
          </Tabs.Tab>
          <Tabs.Tab value="read" px="xl">
            Read
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

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
  )
}

function NotificationList() {
  const { type } = route.useSearch()

  const { paginated } = useNotificationQuery({ query: { type } })

  const { notifications } = paginated

  return notifications.map((notification) => (
    <Fragment key={notification.id}>
      <NotificationItemCard
        title={notification.title}
        content={notification.content}
        date={notification.createdAt}
        unread={!notification.isRead}
        fullContent
      />
      <Divider opacity={0.3} />
    </Fragment>
  ))
}

export default NotificationPage
