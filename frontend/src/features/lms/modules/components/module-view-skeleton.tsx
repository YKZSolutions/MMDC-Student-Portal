import { Box, Group, Paper, Skeleton, Stack } from '@mantine/core'

export function ModuleViewHeaderSkeleton() {
  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="md">
        <Group justify="space-between" align="start">
          <Box style={{ flex: 1 }}>
            <Stack gap="xs">
              <Skeleton height={16} width={120} />
              <Skeleton height={32} width="60%" />
            </Stack>
            <Group gap="xs" mt="sm">
              <Skeleton height={24} width={80} />
            </Group>
          </Box>
          <Skeleton height={36} width={140} />
        </Group>
      </Stack>
    </Paper>
  )
}

export function ModuleViewContentSkeleton() {
  return (
    <Paper withBorder radius="md" py="xl" px="xl">
      <Stack gap="md">
        <Skeleton height={24} width="80%" />
        <Skeleton height={20} width="90%" />
        <Skeleton height={20} width="85%" />
        <Skeleton height={20} width="75%" />
        <Skeleton height={24} mt="md" width="70%" />
        <Skeleton height={20} width="88%" />
        <Skeleton height={20} width="82%" />
      </Stack>
    </Paper>
  )
}

export function ModuleViewProgressSkeleton() {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        <Skeleton height={18} width={80} />
        <Skeleton height={36} width="100%" mb="lg" />
        <Stack gap="md">
          {[1, 2, 3, 4, 5].map((index) => (
            <Group key={index} gap="sm">
              <Skeleton height={20} width={20} circle />
              <Skeleton height={16} width="70%" />
            </Group>
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

export function ModuleViewNavigationSkeleton() {
  return (
    <Paper radius="md">
      <Group justify="space-between">
        <Paper withBorder radius="md" p="sm">
          <Group gap="sm">
            <Skeleton height={14} width={14} />
            <Stack gap={2}>
              <Skeleton height={12} width={80} />
              <Skeleton height={14} width={100} />
            </Stack>
          </Group>
        </Paper>
        <Paper withBorder radius="md" p="sm">
          <Group gap="sm">
            <Stack gap={2}>
              <Skeleton height={12} width={80} />
              <Skeleton height={14} width={100} />
            </Stack>
            <Skeleton height={14} width={14} />
          </Group>
        </Paper>
      </Group>
    </Paper>
  )
}
