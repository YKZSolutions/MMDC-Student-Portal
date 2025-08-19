import RoleComponentManager from '@/components/role-component-manager'
import { SuspendedPagination } from '@/components/suspense-pagination'
import { useAuth } from '@/features/auth/auth.hook'
import { SuspendedBillingTableRows } from '@/features/billing/suspense'
import type {
  BillDto,
  PaginationMetaDto,
  SingleBillDto,
} from '@/integrations/api/client'
import {
  billingControllerFindAllOptions,
  billingControllerFindAllQueryKey,
  billingControllerRemoveMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
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
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCheck,
  IconDotsVertical,
  IconFilter2,
  IconPlus,
  IconSearch,
  IconUpload,
  type ReactNode,
} from '@tabler/icons-react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense, useState } from 'react'

const route = getRouteApi('/(protected)/billing/')

const segmentedControlOptions = [
  { label: 'All', value: 'All' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
  { label: 'Overdue', value: 'Overdue' },
]

interface IBillingQuery {
  search: string
  page: number
  excludeSoftDeleted?: boolean
}

function BillingQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    excludeSoftDeleted: true,
  },
}: {
  children: (props: {
    currentInvoices: SingleBillDto[]
    meta: PaginationMetaDto
    message: string
    totalPages: number
  }) => ReactNode
  props?: IBillingQuery
}) {
  const { authUser } = useAuth('protected')

  const { search, page, excludeSoftDeleted } = props

  const { data } = useSuspenseQuery(
    billingControllerFindAllOptions({
      query: {
        search,
        page,
        // ...(excludeSoftDeleted &&
        //   authUser.role !== 'admin' && { excludeSoftDeleted }),
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
  const searchParam: {
    search: string
  } = route.useSearch()
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
  }

  const [query, setQuery] = useState<IBillingQuery>(queryDefaultValues)

  const { authUser } = useAuth('protected')

  return (
    <Container fluid m={0}>
      <Flex align={'start'}>
        <Box pb={'lg'}>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Billing
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage invoices and billing information here.
          </Text>
        </Box>
        <Group gap={'sm'} align={'center'} ml={'auto'}>
          <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
          >
            Export
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
        </Group>
      </Flex>

      <Stack>
        {/* <Card padding="lg" radius="md" withBorder> */}
        <Group justify="space-between" align="center">
          <SegmentedControl
            bd={'1px solid gray.2'}
            radius={'md'}
            data={segmentedControlOptions}
            color="primary"
          />
          <Group gap="sm">
            {' '}
            {/* Changed spacing to gap */}
            <TextInput
              placeholder="Search name/email"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={rem(250)}
            />
            <Button
              variant="default"
              radius={'md'}
              leftSection={<IconFilter2 color="gray" size={20} />}
              lts={rem(0.25)}
            >
              Filters
            </Button>
          </Group>
        </Group>

        <BillingTable />

        <Suspense fallback={<SuspendedPagination />}>
          <BillingQueryProvider props={query}>
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

function BillingTable() {
  const navigate = useNavigate()
  const { authUser } = useAuth('protected')

  const { mutateAsync: remove } = useMutation({
    ...billingControllerRemoveMutation(),
    onSuccess: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: billingControllerFindAllQueryKey(),
      })
    },
  })

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
              const notifId = notifications.show({
                loading: true,
                title: `Deleting the bill.`,
                message: `Performing the action, please wait.`,
                autoClose: false,
                withCloseButton: false,
              })
              await remove({
                path: {
                  id: id,
                },
              })
              notifications.update({
                id: notifId,
                color: 'teal',
                title: `Bill Deleted`,
                message: `The bill has been deleted.`,
                icon: <IconCheck size={18} />,
                loading: false,
                autoClose: 1500,
              })
            },
          })
        },
      }
    )

  return (
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
        <Table.Tr
          style={{
            border: '0px',
          }}
          bg={'gray.1'}
          c={'dark.5'}
        >
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              admin: (
                <Table.Th>
                  <Checkbox size="sm" />
                </Table.Th>
              ),
            }}
          />
          <Table.Th>Invoice ID</Table.Th>
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              admin: <Table.Th>User</Table.Th>,
              student: <Table.Th>Bill Type</Table.Th>,
            }}
          />
          <Table.Th>Status</Table.Th>
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              admin: <Table.Th>Issue Date</Table.Th>,
              student: <Table.Th>Due Date</Table.Th>,
            }}
          />

          <Table.Th>Amount</Table.Th>
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              admin: <Table.Th></Table.Th>,
            }}
          />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        style={{
          cursor: 'pointer',
        }}
      >
        <Suspense fallback={<SuspendedBillingTableRows />}>
          <BillingQueryProvider>
            {(props) =>
              props.currentInvoices.map((invoice) => (
                <Table.Tr
                  key={invoice.id}
                  onClick={(e) =>
                    navigate({
                      to: '/billing/' + invoice.id,
                    })
                  }
                >
                  <RoleComponentManager
                    currentRole={authUser.role}
                    roleRender={{
                      admin: (
                        <Table.Td>
                          <Checkbox size="sm" />
                        </Table.Td>
                      ),
                    }}
                  />
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
                    <RoleComponentManager
                      currentRole={authUser.role}
                      roleRender={{
                        admin: (
                          <Flex gap={'sm'} align={'center'}>
                            <Flex direction={'column'}>
                              <Text fw={600}>{invoice.payerName}</Text>
                              <Text fz={'sm'} fw={500} c={'dark.2'}>
                                {invoice.payerEmail}
                              </Text>
                            </Flex>
                          </Flex>
                        ),
                        student: (
                          <Text fz={'sm'} fw={500} c={'dark.3'}>
                            Tuition Fee
                          </Text>
                        ),
                      }}
                    />
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
                      {dayjs(invoice.issuedAt).format('MMM D, YYYY')}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" fw={500}>
                      <NumberFormatter
                        prefix="&#8369;"
                        value={invoice.amountToPay}
                        thousandSeparator
                      />
                    </Text>
                  </Table.Td>

                  <RoleComponentManager
                    currentRole={authUser.role}
                    roleRender={{
                      admin: (
                        <Table.Td>
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
                                onClick={(e) =>
                                  handleMenuAction(invoice.id, e).view()
                                }
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                onClick={(e) =>
                                  handleMenuAction(invoice.id, e).edit()
                                }
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                onClick={(e) =>
                                  handleMenuAction(invoice.id, e).delete()
                                }
                                c="red"
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      ),
                    }}
                  />
                </Table.Tr>
              ))
            }
          </BillingQueryProvider>
        </Suspense>
      </Table.Tbody>
    </Table>
  )
}

export default BillingPage
