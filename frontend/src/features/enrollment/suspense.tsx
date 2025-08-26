import { Flex, Skeleton, Table, rem } from '@mantine/core'

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
