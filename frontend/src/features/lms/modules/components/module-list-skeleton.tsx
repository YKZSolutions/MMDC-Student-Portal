import { Box, Group, Skeleton, Stack } from '@mantine/core'

export function ModuleListSkeleton() {
  return (
    <Stack gap="md">
      {[1, 2, 3].map((index) => (
        <Box
          key={index}
          p="xl"
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderRadius: 'var(--mantine-radius-md)',
            minHeight: '100px',
          }}
        >
          <Group gap="md">
            <Skeleton height={24} width={24} circle />
            <Skeleton height={28} width="50%" />
            <Skeleton height={24} width={100} ml="auto" />
          </Group>
        </Box>
      ))}
    </Stack>
  )
}
