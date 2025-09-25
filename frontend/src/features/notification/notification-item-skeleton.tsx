import { Skeleton, Text } from '@mantine/core'
import { Avatar, Box, Divider, Group, Stack } from '@mantine/core'

export interface NotificationItemSkeletonProps {
  fullContent?: boolean
}

export default function NotificationItemSkeleton({
  fullContent = false,
}: NotificationItemSkeletonProps) {
  return (
    <Box pos="relative">
      <Group px="md" py={fullContent ? 'lg' : 'sm'} align="start">
        <Group w="100%" align="start">
          <Skeleton height={38} circle />
          <Stack flex={1} gap={4}>
            <Group align="start" justify="space-between">
              <Skeleton height={16} w="20%" my={4} />
              <Skeleton height={14} w="10%" />
            </Group>

            <Skeleton height={12} w="80%" my={2.5} />
            {/* <Skeleton height={12} w="70%" /> */}
          </Stack>
        </Group>
      </Group>
    </Box>
  )
}
