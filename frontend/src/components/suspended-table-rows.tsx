import { Skeleton, Table } from '@mantine/core'

const SuspendedTableRows = ({
  columns = 6,
  rows = 5,
}: {
  columns?: number
  rows?: number
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Table.Tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Table.Td key={colIdx}>
              <Skeleton height={20} radius="sm" />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </>
  )
}

export default SuspendedTableRows
