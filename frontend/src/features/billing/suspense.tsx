import {
  Card,
  Flex,
  Group,
  Paper,
  rem,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
} from '@mantine/core'

export function SuspendedBillingTableRows() {
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

export function SuspendedBillingPrefaceCard() {
  return (
    <Card withBorder p="lg" radius="md">
      <SimpleGrid
        h="100%"
        cols={{
          // xl: 3, lg: 3,
          xs: 2,
          base: 1,
        }}
        spacing={'xl'}
        p={'sm'}
      >
        <Group>
          <Skeleton circle w={rem(40)} h={rem(40)} />
          <Stack gap={'xs'}>
            <Skeleton height={rem(15)} w={rem(80)} />
            <Skeleton height={rem(15)} w={rem(40)} />
          </Stack>
        </Group>
        <Group>
          <Skeleton circle w={rem(40)} h={rem(40)} />
          <Stack gap={'xs'}>
            <Skeleton height={rem(15)} w={rem(80)} />
            <Skeleton height={rem(15)} w={rem(40)} />
          </Stack>
        </Group>
        <Group>
          <Skeleton circle w={rem(40)} h={rem(40)} />
          <Stack gap={'xs'}>
            <Skeleton height={rem(15)} w={rem(80)} />
            <Skeleton height={rem(15)} w={rem(40)} />
          </Stack>
        </Group>
        <Group>
          <Skeleton circle w={rem(40)} h={rem(40)} />
          <Stack gap={'xs'}>
            <Skeleton height={rem(15)} w={rem(80)} />
            <Skeleton height={rem(15)} w={rem(40)} />
          </Stack>
        </Group>
      </SimpleGrid>
    </Card>
  )
}

export function SuspendedBillingPreface() {
  return (
    <SimpleGrid cols={{ lg: 2, xl: 2, md: 2 }}>
      <SuspendedBillingPrefaceCard />
      <SuspendedBillingPrefaceCard />
    </SimpleGrid>
  )
}

export function SuspendedBillingBreakdown() {
  return (
    <Paper radius="md" withBorder>
      <Table
        verticalSpacing="md"
        highlightOnHover
        highlightOnHoverColor="gray.0"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Skeleton height={rem(20)} w={rem(120)} />
            </Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <Skeleton height={rem(20)} w={rem(120)} />
            </Table.Td>
            <Table.Td>
              <Skeleton ml={'auto'} height={rem(20)} w={rem(120)} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>
              <Skeleton height={rem(20)} w={rem(120)} />
            </Table.Td>
            <Table.Td>
              <Skeleton ml={'auto'} height={rem(20)} w={rem(120)} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>
              <Skeleton height={rem(20)} w={rem(120)} />
            </Table.Td>
            <Table.Td>
              <Skeleton ml={'auto'} height={rem(20)} w={rem(120)} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  )
}

export function SuspendedBillingInstallmentCard() {
  return (
    <Card withBorder p="md" radius="md">
      <Stack gap={rem(10)}>
        <Skeleton height={rem(20)} w={rem(150)} />
        <Skeleton height={rem(15)} w={rem(100)} />
        <Skeleton height={rem(15)} w={rem(100)} />
      </Stack>
    </Card>
  )
}

export function SuspendedBillingInstallment() {
  return (
    <Stack gap={'md'}>
      <SuspendedBillingInstallmentCard />
      <SuspendedBillingInstallmentCard />
      <SuspendedBillingInstallmentCard />
    </Stack>
  )
}
