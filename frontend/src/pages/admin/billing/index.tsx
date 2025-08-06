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
  Pagination,
  rem,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconDotsVertical,
  IconFilter2,
  IconPlus,
  IconSearch,
  IconUpload,
  type ReactNode,
} from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

const route = getRouteApi('/(protected)/billing/')

const MOCK_INVOICES = [
  {
    id: 'P10001',
    issueDate: 'Feb 14, 2025',
    clientName: 'James Anderson',
    status: 'Paid',
    assignedStaff: {
      name: 'Bessie Cooper',
      avatar: 'https://placehold.co/40x40/FF6347/FFFFFF?text=BC',
    },
    services: 'Diagnostic Evaluation',
    price: 160.0,
  },
  {
    id: 'P10002',
    issueDate: 'Apr 22, 2025',
    clientName: 'Alexander Ivanov',
    status: 'Paid',
    assignedStaff: {
      name: 'Leslie Alexander',
      avatar: 'https://placehold.co/40x40/3CB371/FFFFFF?text=LA',
    },
    services: 'Company ITD Solution',
    price: 267.0,
  },
  {
    id: 'P10003',
    issueDate: 'Apr 22, 2024',
    clientName: 'Hugo Fernández',
    status: 'Overdue',
    assignedStaff: {
      name: 'Ralph Edwards',
      avatar: 'https://placehold.co/40x40/FFD700/FFFFFF?text=RE',
    },
    services: 'Appointment Add- on',
    price: 267.18,
  },
  {
    id: 'P10004',
    issueDate: 'Jun 18, 2025',
    clientName: 'Savannah Nguyen',
    status: 'Unpaid',
    assignedStaff: {
      name: 'Savannah Nguyen',
      avatar: 'https://placehold.co/40x40/4682B4/FFFFFF?text=SN',
    },
    services: 'Standard Appointment',
    price: 153.3,
  },
  {
    id: 'P10005',
    issueDate: 'Jul 4, 2025',
    clientName: 'Hiroshi Takahashi',
    status: 'Paid',
    assignedStaff: {
      name: 'Eleanor Pena',
      avatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=EP',
    },
    services: 'Company ITD Solution',
    price: 178.45,
  },
  {
    id: 'P10006',
    issueDate: 'Sep 5, 2024',
    clientName: 'Christopher Miller',
    status: 'Unpaid',
    assignedStaff: {
      name: 'Dianne Russell',
      avatar: 'https://placehold.co/40x40/DAA520/FFFFFF?text=DR',
    },
    services: 'Diagnostic Evaluation',
    price: 235.2,
  },
  {
    id: 'P10007',
    issueDate: 'Nov 3, 2024',
    clientName: 'James Anderson',
    status: 'Overdue',
    assignedStaff: {
      name: 'Leslie Alexander',
      avatar: 'https://placehold.co/40x40/008080/FFFFFF?text=LA',
    },
    services: 'Diagnostic Evaluation',
    price: 124.0,
  },
]

const segmentedControlOptions = [
  { label: 'All', value: 'All' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
  { label: 'Overdue', value: 'Overdue' },
]

interface IBillingQuery {
  search: string
  page: number
}

function BillingQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
  },
}: {
  children: (props: { message: string; totalPages: number }) => ReactNode
  props?: IBillingQuery
}) {
  const { search, page } = props

  // const { data } = useSuspenseQuery(
  //   usersControllerFindAllOptions({
  //     query: { search, page, ...(role && { role }) },
  //   }),
  // )

  const limit = 10
  const total = MOCK_INVOICES.length
  const totalPages = 1

  const message = formatPaginationMessage({ limit, page, total })

  return children({
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

  const currentInvoices = MOCK_INVOICES

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
        <Flex align={'center'} gap={5} ml={'auto'}>
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

          <Button
            variant="filled"
            radius={'md'}
            leftSection={<IconPlus size={20} />}
            lts={rem(0.25)}
          >
            New Invoice
          </Button>
        </Flex>
      </Flex>

      {/* <Card padding="lg" radius="md" withBorder> */}
      <Group justify="space-between" mb="md" align="center">
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
            <Table.Th>
              <Checkbox size="sm" />
            </Table.Th>
            <Table.Th>Invoice ID</Table.Th>
            <Table.Th>Student Name</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Issue Date</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          style={{
            cursor: 'pointer',
          }}
        >
          {currentInvoices.map((invoice) => (
            <Table.Tr
              key={invoice.id}
              onClick={() =>
                navigate({
                  to: '/billing/' + invoice.id,
                })
              }
            >
              <Table.Td>
                <Checkbox size="sm" />
              </Table.Td>
              <Table.Td>{invoice.id}</Table.Td>
              <Table.Td>{invoice.clientName}</Table.Td>
              <Table.Td>
                <Badge variant="light" radius="lg">
                  <Text className="capitalize" fz={'xs'} fw={500}>
                    {invoice.status}
                  </Text>
                </Badge>
              </Table.Td>
              <Table.Td>{invoice.issueDate}</Table.Td>

              <Table.Td>${invoice.price.toFixed(2)}</Table.Td>
              <Table.Td>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" radius={'xl'}>
                      <IconDotsVertical size={20} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item>View Details</Menu.Item>
                    <Menu.Item>Edit</Menu.Item>
                    <Menu.Item c="red">Delete</Menu.Item>{' '}
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
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
      {/* </Card> */}

      {/* <Flex gap={'md'} direction={'column'}>
        <Flex justify={'space-between'}>
          <Flex align={'center'} gap={'xs'}>
            <Title
              display={'flex'}
              c={'dark.7'}
              order={3}
              fw={700}
              lts={rem(0.4)}
            >
              Billing{' '}
            </Title>
          </Flex>
        </Flex>
      </Flex> */}
    </Container>
  )
}

export default BillingPage
