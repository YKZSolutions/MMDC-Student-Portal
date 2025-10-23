import {
  Card,
  Divider,
  Flex,
  Group,
  Skeleton,
  Stack,
  Table,
  rem,
} from '@mantine/core'

export function SuspendedAdminEnrollmentTableRows() {
  return (
    <>
      <Table.Tr>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
        </Table.Td>
        <Table.Td>
          <Skeleton circle height={rem(25)} />
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
        </Table.Td>
        <Table.Td>
          <Skeleton circle height={rem(25)} />
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Skeleton radius={rem(10)} height={rem(15)} width={rem(150)} />
        </Table.Td>
        <Table.Td>
          <Skeleton circle height={rem(25)} />
        </Table.Td>
      </Table.Tr>
    </>
  )
}

export function SuspendedAdminEnrollmentCourseOfferingCards() {
  return (
    <Stack gap={0}>
      <Group grow justify="space-between" align="center" p={'lg'}>
        <Flex direction="column" gap="xs">
          <Skeleton height={20} width="40%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />
        </Flex>

        <Group gap="xs" justify="end">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={32} width={32} circle />
        </Group>
      </Group>
      <Divider />
      <Group grow justify="space-between" align="center" p={'lg'}>
        <Flex direction="column" gap="xs">
          <Skeleton height={20} width="40%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />
        </Flex>

        <Group gap="xs" justify="end">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={32} width={32} circle />
        </Group>
      </Group>
      <Divider />
      <Group grow justify="space-between" align="center" p={'lg'}>
        <Flex direction="column" gap="xs">
          <Skeleton height={20} width="40%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />

          <Skeleton height={14} width="20%" radius="sm" />
        </Flex>

        <Group gap="xs" justify="end">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={32} width={32} circle />
        </Group>
      </Group>
    </Stack>
  )
}

export function SuspendedStudentEnrollmentFinalizationSectionCards() {
  return (
    <Stack gap="xs">
      <Card withBorder radius="md" p="lg" className="flex-1">
        <Group justify="space-between" wrap="nowrap" grow>
          <Stack gap={4} miw={0} className="truncate">
            <Skeleton height={16} width="60%" radius="sm" />
            <Skeleton height={12} width="40%" radius="sm" />
            <Skeleton height={14} width="20%" radius="sm" />
          </Stack>

          <Stack gap={4} miw="fit-content" align="end">
            <Skeleton height={16} width="20%" radius="sm" />
            <Skeleton height={14} width="30%" radius="sm" />
          </Stack>
        </Group>
      </Card>
      <Card withBorder radius="md" p="md" className="flex-1">
        <Group justify="space-between" wrap="nowrap" grow>
          <Stack gap={4} miw={0} className="truncate">
            <Skeleton height={16} width="60%" radius="sm" />
            <Skeleton height={12} width="40%" radius="sm" />
            <Skeleton height={14} width="20%" radius="sm" />
          </Stack>

          <Stack gap={4} miw="fit-content" align="end">
            <Skeleton height={16} width="20%" radius="sm" />
            <Skeleton height={14} width="30%" radius="sm" />
          </Stack>
        </Group>
      </Card>
      <Card withBorder radius="md" p="md" className="flex-1">
        <Group justify="space-between" wrap="nowrap" grow>
          <Stack gap={4} miw={0} className="truncate">
            <Skeleton height={16} width="60%" radius="sm" />
            <Skeleton height={12} width="40%" radius="sm" />
            <Skeleton height={14} width="20%" radius="sm" />
          </Stack>

          <Stack gap={4} miw="fit-content" align="end">
            <Skeleton height={16} width="20%" radius="sm" />
            <Skeleton height={14} width="30%" radius="sm" />
          </Stack>
        </Group>
      </Card>
    </Stack>
  )
}
