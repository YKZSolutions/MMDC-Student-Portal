import {
  Box,
  Container,
  Divider,
  Group,
  Paper,
  rem,
  Skeleton,
  Stack,
} from '@mantine/core'

export function ModuleEditActionBarSkeleton() {
  return (
    <Paper
      shadow="sm"
      p="md"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Skeleton height={40} width={40} />
            <Skeleton height={2} width={1} />
            <Stack gap={4}>
              <Group gap="xs">
                <Skeleton height={24} width={200} />
                <Skeleton height={20} width={50} />
              </Group>
              <Skeleton height={14} width={100} />
            </Stack>
          </Group>

          <Group gap="sm">
            <Skeleton height={40} width={40} />
            <Skeleton height={40} width={40} />
            <Skeleton height={36} width={120} />
          </Group>
        </Group>
      </Container>
    </Paper>
  )
}

export function ModuleEditContentSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="md" bg="white" shadow="sm">
        <Stack gap={0}>
          <Box px={rem(64)} py="xl">
            <Skeleton height={40} width="60%" mb="xs" />
            <Skeleton height={14} width={120} />
          </Box>
          <Divider />
          <Box py="xl" px={rem(64)}>
            <Stack gap="md">
              <Skeleton height={24} width="80%" />
              <Skeleton height={20} width="90%" />
              <Skeleton height={20} width="85%" />
              <Skeleton height={20} width="75%" />
              <Skeleton height={24} mt="md" width="70%" />
              <Skeleton height={20} width="88%" />
              <Skeleton height={20} width="82%" />
              <Skeleton height={20} width="78%" />
              <Skeleton height={24} mt="md" width="65%" />
              <Skeleton height={20} width="92%" />
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}

export function ModuleEditPreviewSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Paper withBorder radius="md" p="xl" bg="white">
          <Stack gap="md">
            <Group align="start" gap="sm" justify="space-between">
              <Box style={{ flex: 1 }}>
                <Stack gap={4}>
                  <Skeleton height={16} width={120} />
                  <Skeleton height={32} width="60%" />
                </Stack>
              </Box>
            </Group>
          </Stack>
        </Paper>
        <Paper withBorder radius="md" py="xl" bg="white">
          <Box px="xl">
            <Stack gap="md">
              <Skeleton height={24} width="80%" />
              <Skeleton height={20} width="90%" />
              <Skeleton height={20} width="85%" />
              <Skeleton height={20} width="75%" />
              <Skeleton height={24} mt="md" width="70%" />
              <Skeleton height={20} width="88%" />
              <Skeleton height={20} width="82%" />
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Container>
  )
}
