import RoleComponentManager from '@/components/role-component-manager'
import { SuspendedPagination } from '@/components/suspense-pagination'
import { useAuth } from '@/features/auth/auth.hook'
import { SuspendedBillingTableRows } from '@/features/billing/suspense'
import type {
  BillDto,
  BillItemDto,
  PaginationMetaDto,
} from '@/integrations/api/client'
import {
  billingControllerFindAllOptions,
  billingControllerFindAllQueryKey,
  billingControllerRemoveMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { formatPaginationMessage } from '@/utils/formatters'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Group,
  Menu,
  NumberFormatter,
  Pagination,
  rem,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconDotsVertical,
  IconEye,
  IconFilter2,
  IconInbox,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import React, { Suspense, useMemo, useState } from 'react'

const route = getRouteApi('/(protected)/billing/')

const segmentedControlOptions = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Overpaid', value: 'overpaid' },
  { label: 'Trash', value: 'deleted' },
] as const

interface IBillingQuery {
  search: string
  page: number
  tab: (typeof segmentedControlOptions)[number]['value']
}

interface IBillingSearchParams {
  search: string
  tab: IBillingQuery['tab']
}

function BillingQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    tab: 'all',
  },
}: {
  children: (props: {
    currentInvoices: BillItemDto[]
    meta: PaginationMetaDto
    message: string
    totalPages: number
  }) => ReactNode
  props?: IBillingQuery
}) {
  const { search, page, tab } = props

  const status: BillItemDto['status'] | undefined =
    tab && !['all', 'deleted'].includes(tab)
      ? (tab as BillItemDto['status'])
      : undefined

  const isDeleted = tab === 'deleted' || undefined

  const { data } = useSuspenseQuery(
    billingControllerFindAllOptions({
      query: {
        search,
        page,
        status,
        isDeleted,
      },
    }),
  )

  const currentInvoices = data.bills || []

  console.log(currentInvoices)

  const meta = data.meta as PaginationMetaDto
  const limit = 10
  const total = meta.totalCount ?? 0
  const totalPages = meta.pageCount ?? 0

  const message = formatPaginationMessage({ limit, page, total })

  return children({
    currentInvoices,
    meta,
    message,
    totalPages,
  })
}

function BillingPage() {
  const searchParam: IBillingSearchParams = route.useSearch()
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
    tab: searchParam.tab || ('all' as IBillingQuery['tab']),
  }

  const [query, setQuery] = useState<IBillingQuery>(queryDefaultValues)

  // Since searchParam is debounced,
  // this is what we need to pass to the query provider
  // This will ensure that the query is also debounced
  const debouncedQuery = {
    search: searchParam.search || '',
    page: query.page,
    tab: query.tab,
  } as IBillingQuery

  const { authUser } = useAuth('protected')

  const handleTabChange = (value: IBillingQuery['tab']) => {
    setQuery((prev) => ({ ...prev, tab: value }))

    navigate({
      to: '/billing',
      search: (prev) => ({
        ...prev,
        tab: value !== 'all' ? value : undefined,
      }),
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setQuery((prev) => ({
      ...prev,
      search: value,
    }))

    handleNavigate(value)
  }

  const handleNavigate = useDebouncedCallback(async (value: string) => {
    navigate({
      to: '/billing',
      search: (prev) => ({
        ...prev,
        search: value.trim() || undefined,
      }),
    })
  }, 200)

  return (
    <Container size={'md'} pb={'xl'}>
      <Group align={'start'} pb={'lg'}>
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Billing
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage invoices and billing information here.
          </Text>
        </Box>
      </Group>

      <Stack>
        <Flex
          wrap="wrap"
          gap={{ base: 'sm', xs: 'sm' }}
          justify={'end'}
          align="center"
        >
          <ScrollArea w={{ base: '100%', xs: 'auto' }}>
            <SegmentedControl
              w={{ base: '100%', xs: 'auto' }}
              bd={'1px solid gray.2'}
              data={[...segmentedControlOptions]}
              defaultValue={searchParam.tab || 'all'}
              color="primary"
              onChange={(value) =>
                handleTabChange(value as IBillingQuery['tab'])
              }
            />
          </ScrollArea>
          <Flex
            gap={'sm'}
            direction={{ base: 'column', xs: 'row' }}
            w={{ base: '100%', xs: 'auto' }}
            ml={'auto'}
            wrap={'wrap'}
            justify={'end'}
          >
            <TextInput
              placeholder="Search name/email"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={{ base: '100%', xs: rem(250) }}
              onChange={handleSearch}
            />
            <Button
              variant="default"
              radius={'md'}
              leftSection={<IconFilter2 color="gray" size={20} />}
              lts={rem(0.25)}
            >
              Filters
            </Button>
            <RoleComponentManager
              currentRole={authUser.role}
              roleRender={{
                admin: (
                  <Button
                    variant="filled"
                    radius={'md'}
                    leftSection={<IconPlus size={20} />}
                    lts={rem(0.25)}
                    onClick={() =>
                      navigate({
                        to: '/billing/create',
                      })
                    }
                  >
                    New Invoice
                  </Button>
                ),
              }}
            />
          </Flex>
        </Flex>

        <BillingTable query={debouncedQuery} />

        <Suspense fallback={<SuspendedPagination />}>
          <BillingQueryProvider props={debouncedQuery}>
            {(props) => (
              <Group justify="flex-end">
                <Text size="sm">{props.message}</Text>
                <Pagination
                  total={props.totalPages}
                  value={query.page}
                  withPages={false}
                />
              </Group>
            )}
          </BillingQueryProvider>
        </Suspense>
        {/* </Card> */}
      </Stack>
    </Container>
  )
}

function BillingTable({ query }: { query: IBillingQuery }) {
  const navigate = useNavigate()
  const { authUser } = useAuth('protected')

  /**
   * Count the number of columns in the table based on the user's role.
   * This is used to set the `colSpan` attribute for the "No bills found" row.
   */
  const columnCount = useMemo(() => {
    console.log('changed')
    return React.Children.count(
      authUser.role === 'admin'
        ? AdminBillingTableHeader().props.children
        : StudentBillingTableHeader().props.children,
    )
  }, [authUser.role])

  return (
    <Table.ScrollContainer minWidth={rem(700)} type="native">
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
      >
        <Table.Thead>
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              admin: <AdminBillingTableHeader />,
              student: <StudentBillingTableHeader />,
            }}
          />
        </Table.Thead>
        <Table.Tbody
          style={{
            cursor: 'pointer',
          }}
        >
          <Suspense fallback={<SuspendedBillingTableRows />}>
            <BillingQueryProvider props={query}>
              {(props) =>
                props.currentInvoices.length == 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={columnCount}>
                      <Flex
                        align="center"
                        justify="center"
                        direction="column"
                        py="xl"
                        c="dark.3"
                      >
                        <IconInbox size={36} stroke={1.5} />
                        <Text mt="sm" fw={500}>
                          No bills found
                        </Text>
                        <Text fz="sm" c="dark.2">
                          Try other search terms or filters.
                        </Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  props.currentInvoices.map((invoice) => (
                    <RoleComponentManager
                      key={invoice.id}
                      currentRole={authUser.role}
                      roleRender={{
                        admin: <AdminBillingTableBody invoice={invoice} />,
                        student: <StudentBillingTableBody invoice={invoice} />,
                      }}
                    />
                  ))
                )
              }
            </BillingQueryProvider>
          </Suspense>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

function AdminBillingTableHeader() {
  return (
    <Table.Tr
      style={{
        border: '0px',
      }}
      bg={'gray.1'}
      c={'dark.5'}
    >
      <Table.Th>
        <Checkbox size="sm" />
      </Table.Th>
      <Table.Th>Invoice ID</Table.Th>
      <Table.Th>User</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Issue Date</Table.Th>
      <Table.Th>Amount</Table.Th>
      <Table.Th></Table.Th>
    </Table.Tr>
  )
}

function AdminBillingTableBody({ invoice }: { invoice: BillItemDto }) {
  const searchParam: IBillingSearchParams = route.useSearch()
  const navigate = useNavigate()

  const { mutateAsync: remove } = useAppMutation(
    billingControllerRemoveMutation,
    {
      loading:
        searchParam.tab !== 'deleted'
          ? { title: 'Moving to Trash', message: 'Please wait...' }
          : { title: 'Deleting Bill', message: 'Please wait...' },
      success:
        searchParam.tab !== 'deleted'
          ? {
              title: 'Bill moved to Trash',
              message: 'The bill has been successfully moved to Trash.',
            }
          : {
              title: 'Bill Deleted',
              message: 'The bill has been permanently deleted.',
            },
      error: {
        title: 'Failed to delete the bill.',
        message:
          'An error occurred while trying to delete the bill. Please try again.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()
        queryClient.invalidateQueries({
          queryKey: billingControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleMenuAction = (
    id: BillDto['id'],
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) =>
    // Prevent the list from being clicked when a menu item is clicked
    (
      e.stopPropagation(),
      {
        view: () => {
          navigate({
            to: `/billing/${id}`,
          })
        },
        edit: () => {
          navigate({
            to: `/billing/${id}/edit`,
          })
        },
        delete: () => {
          modals.openConfirmModal({
            title: (
              <Text fw={600} c={'dark.7'}>
                Delete Bill
              </Text>
            ),
            children: (
              <Text size="sm" c={'dark.3'}>
                Are you sure you want to delete this bill? This action cannot be
                undone.
              </Text>
            ),
            centered: true,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
              await remove({
                path: {
                  id: id,
                },
              })
            },
          })
        },
      }
    )
  return (
    <Table.Tr
      key={invoice.id}
      onClick={(e) =>
        navigate({
          to: '/billing/' + invoice.id,
        })
      }
    >
      <Table.Td>
        <Checkbox size="sm" />
      </Table.Td>
      <Table.Td>
        <Tooltip withArrow position="bottom" label={invoice.id}>
          <Text
            className="max-w-[17ch]"
            size="sm"
            c={'dark.3'}
            truncate
            fw={500}
          >
            {invoice.id}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Flex gap={'sm'} align={'center'}>
          <Flex direction={'column'}>
            <Text fw={600}>{invoice.payerName}</Text>
            <Text fz={'sm'} fw={500} c={'dark.2'}>
              {invoice.payerEmail}
            </Text>
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" radius="lg">
          <Text className="capitalize" fz={'xs'} fw={500}>
            {invoice.status}
          </Text>
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {dayjs(invoice.createdAt).format('MMM D, YYYY')}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={500}>
          <NumberFormatter
            prefix="&#8369;"
            value={invoice.totalAmount}
            thousandSeparator
          />
        </Text>
      </Table.Td>

      <Table.Td>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon
              onClick={(e) => e.stopPropagation()}
              variant="subtle"
              color="gray"
              radius="xl"
            >
              <IconDotsVertical size={20} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.5} />}
              onClick={(e) => handleMenuAction(invoice.id, e).view()}
            >
              View Details
            </Menu.Item>

            <Menu.Item
              leftSection={<IconPencil size={16} stroke={1.5} />}
              onClick={(e) => handleMenuAction(invoice.id, e).edit()}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              leftSection={<IconTrash size={16} stroke={1.5} />}
              onClick={(e) => handleMenuAction(invoice.id, e).delete()}
              c="red"
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  )
}

function StudentBillingTableHeader() {
  return (
    <Table.Tr
      style={{
        border: '0px',
      }}
      bg={'gray.1'}
      c={'dark.5'}
    >
      <Table.Th>Invoice ID</Table.Th>
      <Table.Th>Bill Type</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Due Date</Table.Th>
      <Table.Th>Amount</Table.Th>
    </Table.Tr>
  )
}

function StudentBillingTableBody({ invoice }: { invoice: BillItemDto }) {
  const navigate = useNavigate()

  return (
    <Table.Tr
      key={invoice.id}
      onClick={(e) =>
        navigate({
          to: '/billing/' + invoice.id,
        })
      }
    >
      <Table.Td>
        <Tooltip withArrow position="bottom" label={invoice.id}>
          <Text
            className="max-w-[17ch]"
            size="sm"
            c={'dark.3'}
            truncate
            fw={500}
          >
            {invoice.id}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text fz={'sm'} fw={500} c={'dark.3'}>
          Tuition Fee
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" radius="lg">
          <Text className="capitalize" fz={'xs'} fw={500}>
            {invoice.status}
          </Text>
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {dayjs(invoice.createdAt).format('MMM D, YYYY')}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={500}>
          <NumberFormatter
            prefix="&#8369;"
            value={invoice.totalAmount}
            thousandSeparator
          />
        </Text>
      </Table.Td>
    </Table.Tr>
  )
}

export default BillingPage
