import {
  Accordion,
  Box,
  Card,
  Divider,
  Flex,
  Group,
  rem,
  Skeleton,
  Stack,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { Fragment } from 'react/jsx-runtime'

type CourseListSuspenseProps = {
  variant?: 'card' | 'row'
  count?: number
}

function CardSkeleton() {
  const theme = useMantineTheme()
  return (
    <Card
      withBorder
      radius="md"
      p={0}
      miw={rem(280)}
      maw={rem('32%')}
      w={'100%'}
      className="drop-shadow-xs"
    >
      <Flex pos="relative">
        <Skeleton height={rem(100)} radius={0} />

        <Box
          pos={'absolute'}
          right={rem(16)}
          bottom={rem(-24)}
          w={rem(48)}
          h={rem(48)}
          style={{ zIndex: 2 }}
        >
          <Skeleton circle height={rem(48)} width={rem(48)} />
        </Box>
      </Flex>

      <Box p="md" style={{ minHeight: rem(120) }}>
        <Title order={4}>
          <Skeleton height={18} width="70%" />
        </Title>
        <Group gap={rem(5)} mt={6}>
          <Skeleton height={12} width={60} />
          <Skeleton height={12} width={80} />
        </Group>

        <Skeleton mt={8} height={12} width="50%" />
      </Box>

      <Divider />
      <Group justify="space-between" p={'xs'} align="center">
        <Group gap={rem(5)}>
          <Skeleton circle height={30} width={30} />
          <Skeleton height={12} width={40} />
        </Group>

        <Group>
          <Skeleton height={34} width={34} />
          <Skeleton height={34} width={34} />
          <Skeleton height={34} width={34} />
        </Group>
      </Group>
    </Card>
  )
}

function RowSkeleton() {
  return (
    <Card
      radius="md"
      p={'lg'}
      withBorder
      className={'drop-shadow-xs'}
      w={'100%'}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs" justify="center">
          <Title order={4}>
            <Skeleton height={18} width={300} />
          </Title>
          <Group gap={rem(5)}>
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={180} />
          </Group>
        </Stack>

        <Stack align="end">
          <Group>
            <Skeleton height={34} width={34} />
            <Skeleton height={34} width={34} />
            <Skeleton height={34} width={34} />
          </Group>
          <Group gap={rem(5)}>
            <Skeleton circle height={30} width={30} />
            <Skeleton height={12} width={40} />
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

export function CourseListSuspense({
  variant = 'card',
  count = 3,
}: CourseListSuspenseProps) {
  const items = Array.from({ length: count })
  if (variant === 'row') {
    return (
      <Stack>
        {items.map((_, i) => (
          <div key={i}>
            <RowSkeleton />
          </div>
        ))}
      </Stack>
    )
  }

  return (
    <Group>
      {items.map((_, i) => (
        <div key={i}>
          {variant === 'card' ? <CardSkeleton /> : <RowSkeleton />}
        </div>
      ))}
    </Group>
  )
}

export function CourseHeaderSkeleton() {
  return (
    <Box>
      <Title order={3}>
        <Skeleton height={31} width={420} />
      </Title>
      <Group gap={'xs'} mt={6}>
        <Skeleton height={14} width={80} />
        <Skeleton height={14} width={8} />
        <Skeleton height={14} width={120} />
        <Skeleton height={14} width={8} />
        <Skeleton height={14} width={64} />
        <Skeleton height={14} width={8} />
        <Skeleton height={14} width={140} />
      </Group>
    </Box>
  )
}

type ModulePanelSuspenseProps = {
  sections?: number
  subsectionsPerSection?: number
  itemsPerSubsection?: number
}

export function ModulePanelSuspense({
  sections = 3,
  subsectionsPerSection = 2,
  itemsPerSubsection = 2,
}: ModulePanelSuspenseProps) {
  const theme = useMantineTheme()

  const sectionIndexes = Array.from({ length: sections })

  return (
    <Accordion multiple variant="filled" chevronPosition="left">
      {sectionIndexes.map((_, si) => (
        <Fragment key={si}>
          <Accordion.Item key={si} value={`section-${si}`}>
            <Accordion.Control py={'sm'}>
              <Group wrap="nowrap">
                <Stack gap={'xs'} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Title order={4} fw={600}>
                      <Skeleton height={18} width={240} />
                    </Title>
                    <Skeleton height={14} width={60} />
                  </Group>
                  <Skeleton height={12} width={180} />
                </Stack>
              </Group>
            </Accordion.Control>

            <Accordion.Panel>
              <Accordion
                multiple
                chevronPosition="left"
                variant="separated"
                radius={'md'}
                styles={{ chevron: { padding: theme.spacing.sm } }}
              >
                {Array.from({ length: subsectionsPerSection }).map(
                  (_, subi) => (
                    <Accordion.Item
                      key={subi}
                      value={`section-${si}-sub-${subi}`}
                    >
                      <Accordion.Control py={'sm'}>
                        <Group wrap="nowrap">
                          <Stack gap={'xs'} style={{ flex: 1 }}>
                            <Group gap="xs" mb={4}>
                              <Title order={5} fw={600}>
                                <Skeleton height={16} width={200} />
                              </Title>
                              <Skeleton height={12} width={48} />
                            </Group>
                            <Skeleton height={10} width={140} />
                          </Stack>
                        </Group>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <Stack gap="xs">
                          {Array.from({ length: itemsPerSubsection }).map(
                            (_, ii) => (
                              <div key={ii}>
                                <CardSkeleton />
                              </div>
                            ),
                          )}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ),
                )}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
          <Divider />
        </Fragment>
      ))}
    </Accordion>
  )
}
