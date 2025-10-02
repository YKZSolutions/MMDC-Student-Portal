import { Text } from '@mantine/core'
import { Avatar, Box, Divider, Group, Stack } from '@mantine/core'
import dayjs from 'dayjs'

export interface NotificationRowProps {
  icon?: string
  title: string
  content: string
  date: string
  unread?: boolean
  fullContent?: boolean
}

export default function NotificationItemCard({
  icon,
  title,
  content,
  date,
  unread,
  fullContent = false,
}: NotificationRowProps) {
  return (
    <Box pos="relative">
      {unread && (
        <Divider
          h="100%"
          bd="2px solid primary"
          pos="absolute"
          orientation="vertical"
        />
      )}

      <Group
        px="md"
        py={fullContent ? 'lg' : 'sm'}
        align="start"
        className="rounded-sm hover:bg-neutral-100"
      >
        <Group w="100%" align="start">
          <Avatar></Avatar>
          <Stack flex={1} gap={0}>
            <Group align="start" justify="space-between">
              <Text
                c={unread ? 'primary' : undefined}
                fw={unread ? 500 : undefined}
              >
                {title}
              </Text>

              <Text size="sm" c="dimmed">
                {dayjs(date).fromNow()}
              </Text>
            </Group>
            <Text
              w="90%"
              size="sm"
              c="dimmed"
              lineClamp={!fullContent ? 2 : undefined}
            >
              {content}
            </Text>
          </Stack>
        </Group>
      </Group>
    </Box>
  )
}
