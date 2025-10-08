import {
  Card,
  Group,
  rem,
  SimpleGrid,
  Skeleton,
  Stack,
  ThemeIcon,
} from '@mantine/core'

// A compact skeleton that mirrors the Admin Dashboard layout used in
// `dashboard.admin.tsx`. Exported as a named component `DashboardSkeleton` so
// the page can use it as a Suspense fallback.
export function DashboardSkeleton() {
  return (
  <Stack gap="xl">
      {/* Header */}
  <Stack gap={4}>
        <Skeleton height={rem(28)} width={rem(220)} />
        <Skeleton height={rem(14)} width={rem(320)} />
      </Stack>

      {/* Top Stats Row (3) */}
  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} p="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" align="center">
              <Stack gap={6}>
                <Skeleton height={rem(12)} width={rem(110)} />
                <Skeleton height={rem(28)} width={rem(80)} />
                <Skeleton height={rem(12)} width={rem(140)} />
              </Stack>

              <ThemeIcon size={60} radius="md" variant="light">
                <Skeleton circle height={rem(36)} width={rem(36)} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Two large cards: Active Enrollment + Course Progress */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card p="lg" radius="md" withBorder>
          <Group justify="space-between" align="flex-start">
            <Group>
              <ThemeIcon size={36} radius="md" variant="light">
                <Skeleton circle height={rem(20)} width={rem(20)} />
              </ThemeIcon>
              <Stack gap={4}>
                <Skeleton height={rem(12)} width={rem(160)} />
                <Skeleton height={rem(18)} width={rem(260)} />
                <Skeleton height={rem(18)} width={rem(100)} />
              </Stack>
            </Group>

            <Skeleton height={rem(36)} width={rem(36)} />
          </Group>
        </Card>

        <Card p="lg" radius="md" withBorder>
            <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={36} radius="md" variant="light">
                  <Skeleton circle height={rem(20)} width={rem(20)} />
                </ThemeIcon>
                <Skeleton height={rem(16)} width={rem(180)} />
              </Group>
              <Skeleton height={rem(20)} width={rem(36)} />
            </Group>

            <Stack gap={8}>
              <Skeleton height={rem(12)} width={rem(220)} />
              <Skeleton height={rem(12)} width={rem(180)} />
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Activity Cards: Recent Bills + Recent Enrollments */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={36} radius="md" variant="light">
                  <Skeleton circle height={rem(20)} width={rem(20)} />
                </ThemeIcon>
                <Skeleton height={rem(16)} width={rem(140)} />
              </Group>
              <Skeleton height={rem(20)} width={rem(36)} />
            </Group>

            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} p="md" radius="md" bg="gray.0" withBorder>
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Skeleton height={rem(12)} width={rem(140)} />
                      <Skeleton height={rem(10)} width={rem(100)} />
                    </Stack>
                    <Skeleton circle height={rem(24)} width={rem(24)} />
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={36} radius="md" variant="light">
                  <Skeleton circle height={rem(20)} width={rem(20)} />
                </ThemeIcon>
                <Skeleton height={rem(16)} width={rem(140)} />
              </Group>
              <Skeleton height={rem(20)} width={rem(36)} />
            </Group>

            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} p="md" radius="md" bg="gray.0" withBorder>
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Skeleton height={rem(12)} width={rem(140)} />
                      <Skeleton height={rem(10)} width={rem(80)} />
                    </Stack>
                    <Skeleton radius={rem(8)} height={rem(16)} width={rem(48)} />
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

export default DashboardSkeleton
