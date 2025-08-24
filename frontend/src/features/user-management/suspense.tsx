import { Flex, rem, Skeleton, Table } from '@mantine/core'

export function SuspendedUserTableRows() {
  return (
    <>
      <Table.Tr>
        <Table.Td>
          <Skeleton visible height={rem(20)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'sm'} align={'center'} py={rem(5)}>
            <Skeleton circle height={rem(35)} />
            <Flex direction={'column'} gap={'xs'}>
              <Skeleton height={rem(10)} width={rem(100)} />
              <Skeleton height={rem(10)} width={rem(150)} />
            </Flex>
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
          <Skeleton visible height={rem(20)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'sm'} align={'center'} py={rem(5)}>
            <Skeleton circle height={rem(35)} />
            <Flex direction={'column'} gap={'xs'}>
              <Skeleton height={rem(10)} width={rem(100)} />
              <Skeleton height={rem(10)} width={rem(150)} />
            </Flex>
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
          <Skeleton visible height={rem(20)} width={rem('100%')} />
        </Table.Td>
        <Table.Td>
          <Flex gap={'sm'} align={'center'} py={rem(5)}>
            <Skeleton circle height={rem(35)} />
            <Flex direction={'column'} gap={'xs'}>
              <Skeleton height={rem(10)} width={rem(100)} />
              <Skeleton height={rem(10)} width={rem(150)} />
            </Flex>
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
