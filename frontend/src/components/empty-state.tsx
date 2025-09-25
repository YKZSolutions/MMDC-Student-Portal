import { Box, Text, Stack, Group } from '@mantine/core'
import { IconMoodEmpty } from '@tabler/icons-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon = <IconMoodEmpty size={48} stroke={1.5} />,
  title = 'Nothing here yet',
  description = 'There is currently no data to display.',
  action,
}: EmptyStateProps) {
  return (
    <Box p="xl">
      <Stack align="center" gap="md">
        <Box c="gray.5">{icon}</Box>
        <Stack align="center" gap={2}>
          <Text size="lg" fw={500}>
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
        {action && <Group justify="center">{action}</Group>}
      </Stack>
    </Box>
  )
}
