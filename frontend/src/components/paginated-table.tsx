import type { PaginationMetaDto } from '@/integrations/api/client'
import { formatMetaToPagination } from '@/utils/formatters'
import {
  ActionIcon,
  Checkbox,
  Group,
  Menu,
  Pagination,
  rem,
  Stack,
  Table,
  Text,
  type TableProps,
} from '@mantine/core'
import { IconDotsVertical } from '@tabler/icons-react'
import { type ReactNode } from 'react'

interface PaginatedTableProps<T> {
  data: T[]
  meta: PaginationMetaDto
  checkbox?: boolean
  menu?: boolean
  heading: string[]
  tableProps?: TableProps
  currentPage?: number
  fullHeight?: boolean
  rowComponent: (data: T) => ReactNode
  menuComponent?: (data: T) => ReactNode
  onPaginationChange?: (value: number) => void
  onItemView?: (item: T) => void
  onItemEdit?: (item: T) => void
  onItemDelete?: (item: T) => void
}

function PaginatedTable<T>({
  data,
  meta,
  checkbox = true,
  menu = true,
  currentPage = 1,
  heading,
  tableProps,
  fullHeight = false,
  rowComponent,
  menuComponent,
  onPaginationChange,
  onItemView,
  onItemEdit,
  onItemDelete,
}: PaginatedTableProps<T>) {
  const { message } = formatMetaToPagination({
    limit: 10,
    page: meta.currentPage,
    meta: meta,
  })

  return (
    <Stack flex={1} justify={fullHeight ? 'space-between' : undefined}>
      <Table
        verticalSpacing={'md'}
        highlightOnHover
        highlightOnHoverColor="gray.0"
        style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
        {...tableProps}
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
            }}
            bg={'gray.1'}
            c={'dark.5'}
          >
            {checkbox && (
              <Table.Th>
                <Checkbox size="sm" />
              </Table.Th>
            )}

            {heading.map((item, index) => (
              <Table.Th key={index}>{item}</Table.Th>
            ))}

            {menu && <Table.Th></Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          style={{
            cursor: 'pointer',
          }}
        >
          {data.map((item, idx) => (
            <Table.Tr key={idx}>
              {checkbox && (
                <Table.Td>
                  <Checkbox size="sm" />
                </Table.Td>
              )}

              {rowComponent(item)}

              {menu && (
                <Table.Td>
                  {menuComponent ? (
                    menuComponent(item)
                  ) : (
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon
                          onClick={(e) => e.stopPropagation()}
                          variant="subtle"
                          color="gray"
                          radius={'xl'}
                        >
                          <IconDotsVertical size={20} stroke={1.5} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() => onItemView && onItemView(item)}
                        >
                          View Details
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => onItemEdit && onItemEdit(item)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          c="red"
                          onClick={() => onItemDelete && onItemDelete(item)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="flex-end">
        <Text size="sm">{message}</Text>
        <Pagination
          total={meta.pageCount}
          value={currentPage || 1}
          onChange={onPaginationChange}
          withPages={false}
        />
      </Group>
    </Stack>
  )
}

export default PaginatedTable
