import { Center, Stack, Text } from '@mantine/core'
import { IconMoodSad } from '@tabler/icons-react'

export function ErrorFallback() {
  return (
    <Center h="100vh">
      <Stack align="center" gap="xs">
        <IconMoodSad
          size={48}
          stroke={1.5}
          color="var(--mantine-color-red-6)"
        />
        <Text fw={500} size="lg">
          An unexpected error has occurred
        </Text>
      </Stack>
    </Center>
  )
}
