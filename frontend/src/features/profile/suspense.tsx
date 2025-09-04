import { Container, Flex, Grid, Group, Paper, Skeleton, Stack, rem } from "@mantine/core";

export function SuspendedProfile() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section Skeleton */}
        <Group gap="lg" align="start">
          <Skeleton height={90} width={90} radius={90} />
          <Stack gap={rem(5)} my={'auto'}>
            <Skeleton height={32} width={180} radius="sm" />
            <Skeleton height={24} width={100} radius="sm" />
            <Skeleton height={18} width={120} radius="sm" />
          </Stack>
          <Flex gap="md" ml="auto">
            <Skeleton height={36} width={100} radius="md" />
            <Skeleton height={36} width={100} radius="md" />
          </Flex>
        </Group>
        {/* Info Sections Skeleton */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              radius="md"
              p="xl"
              withBorder
              h="100%"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
                minHeight: '100%',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Skeleton height={28} width={160} radius="sm" />
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap={rem(5)}>
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={24} width={80} radius="sm" />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap={rem(5)}>
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={24} width={80} radius="sm" />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap={rem(5)}>
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={24} width={80} radius="sm" />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              radius="md"
              p="xl"
              withBorder
              h="100%"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
                minHeight: '100%',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Skeleton height={28} width={160} radius="sm" />
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap={rem(5)}>
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={24} width={80} radius="sm" />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap={rem(5)}>
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={24} width={80} radius="sm" />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}