import { SuspendedPagination } from '@/components/suspense-pagination'
import EnrollmentBadgeStatus from '@/features/enrollment/enrollment-badge-status'
import { SuspendedAdminEnrollmentTableRows } from '@/features/enrollment/suspense'
import type {
  BillDto,
  EnrollmentPeriodDto,
  PaginationMetaDto,
} from '@/integrations/api/client'
import {
  enrollmentControllerFindAllEnrollmentsOptions,
  enrollmentControllerFindAllEnrollmentsQueryKey,
  enrollmentControllerRemoveEnrollmentMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { formatPaginationMessage, formatToSchoolYear } from '@/utils/formatters'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Pagination,
  rem,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconDotsVertical,
  IconEye,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense, useState } from 'react'

const route = getRouteApi('/(protected)/enrollment/')

interface EnrollmentPeriod {
  id: string
  school_year: string
  term: number
  start_date: Date
  end_date: Date
  status: 'ongoing' | 'done'
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

const mockEnrollmentPeriods: EnrollmentPeriod[] = [
  {
    id: 'enroll_period_12345',
    school_year: '2023 - 2024',
    term: 1,
    start_date: new Date('2024-01-15'),
    end_date: new Date('2024-05-15'),
    status: 'done',
    created_at: new Date('2023-12-01T10:00:00Z'),
    updated_at: new Date('2024-05-16T12:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'enroll_period_67890',
    school_year: '2023 - 2024',
    term: 2,
    start_date: new Date('2024-06-01'),
    end_date: new Date('2024-09-30'),
    status: 'ongoing',
    created_at: new Date('2024-05-20T09:00:00Z'),
    updated_at: new Date('2024-05-20T09:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'enroll_period_abcde',
    school_year: '2022 - 2023',
    term: 1,
    start_date: new Date('2023-01-15'),
    end_date: new Date('2023-05-15'),
    status: 'done',
    created_at: new Date('2022-12-01T10:00:00Z'),
    updated_at: new Date('2023-05-16T12:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'enroll_period_fghij',
    school_year: '2022 - 2023',
    term: 2,
    start_date: new Date('2023-06-01'),
    end_date: new Date('2023-09-30'),
    status: 'done',
    created_at: new Date('2023-05-20T09:00:00Z'),
    updated_at: new Date('2023-10-01T11:00:00Z'),
    deleted_at: null,
  },
]

interface IEnrollmentAdminQuery {
  search: string
  page: number
}

function EnrollmentAdminQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
  },
}: {
  children: (props: {
    enrollmentPeriods: EnrollmentPeriodDto[]
    meta: PaginationMetaDto
    message: string
    totalPages: number
  }) => ReactNode
  props?: IEnrollmentAdminQuery
}) {
  const { search, page } = props

  const { data } = useSuspenseQuery(
    enrollmentControllerFindAllEnrollmentsOptions({
      query: {
        page: page,
        search: search || undefined,
      },
    }),
  )

  const enrollmentPeriods = data.enrollments

  const meta = data.meta
  const limit = 10
  const total = meta.totalCount ?? 0
  const totalPages = meta.pageCount ?? 0

  const message = formatPaginationMessage({ limit, page, total })

  return children({
    enrollmentPeriods,
    meta,
    message,
    totalPages,
  })
}

function EnrollmentAdminPage() {
  const searchParam: {
    search: string
  } = route.useSearch()
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
  }

  const [query, setQuery] = useState<IEnrollmentAdminQuery>(queryDefaultValues)

  const debouncedQuery = {
    search: searchParam.search || '',
    page: query.page,
  } as IEnrollmentAdminQuery

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
      to: '/enrollment',
      search: (prev) => ({
        ...prev,
        search: value.trim() || undefined,
      }),
    })
  }, 200)

  const handlePage = (page: IEnrollmentAdminQuery['page']) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }))
  }

  return (
    <Container fluid m={0} pb={'xl'}>
      <Stack gap={'lg'}>
        {/* Page Hero */}
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Enrollment
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage student enrollment and course selection.
          </Text>
        </Box>

        <Stack gap={'md'}>
          <Group gap={rem(5)} justify="end" align="center">
            {/* Changed spacing to gap */}
            <TextInput
              placeholder="Search year/term/date"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={rem(250)}
              value={query.search}
              // TODO: This feature is currently not implemented
              // onChange={(e) => handleSearch(e)}
            />
            <Button
              variant="default"
              radius={'md'}
              leftSection={<IconFilter2 color="gray" size={20} />}
              lts={rem(0.25)}
            >
              Filters
            </Button>
            <Button
              variant="filled"
              radius={'md'}
              leftSection={<IconPlus size={20} />}
              lts={rem(0.25)}
              onClick={() => navigate({ to: '/enrollment/create' })}
            >
              Create
            </Button>
          </Group>

          {/* Table */}
          <EnrollmentTable props={debouncedQuery} />

          {/* Pagination */}
          <Suspense fallback={<SuspendedPagination />}>
            <EnrollmentAdminQueryProvider>
              {(props) => (
                <Group justify="flex-end">
                  <Text size="sm">{props.message}</Text>
                  <Pagination
                    total={props.totalPages}
                    value={query.page}
                    onChange={handlePage}
                    withPages={false}
                  />
                </Group>
              )}
            </EnrollmentAdminQueryProvider>
          </Suspense>
        </Stack>
      </Stack>
    </Container>
  )
}

function EnrollmentTable({ props }: { props: IEnrollmentAdminQuery }) {
  const navigate = useNavigate()

  const { mutateAsync: remove } = useAppMutation(
    enrollmentControllerRemoveEnrollmentMutation,
    {
      loading: {
        title: 'Deleting Enrollment Period',
        message: 'Please wait while the enrollment period is being deleted...',
      },
      success: {
        title: 'Enrollment Period deleted',
        message: 'The enrollment period has been successfully deleted.',
      },
      error: {
        title: 'Failed to delete the enrollment period.',
        message:
          'An error occurred while trying to delete the enrollment period. Please try again.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()
        queryClient.invalidateQueries({
          queryKey: enrollmentControllerFindAllEnrollmentsQueryKey(),
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
            to: `/enrollment/${id}`,
          })
        },
        edit: () => {},
        delete: () => {
          modals.openConfirmModal({
            title: (
              <Text fw={600} c={'dark.7'}>
                Delete Enrollment Period
              </Text>
            ),
            children: (
              <Text size="sm" c={'dark.3'}>
                Are you sure you want to delete this enrollment period? This
                action cannot be undone.
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
                query: {
                  directDelete: true,
                },
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
          <Table.Th>School Year</Table.Th>
          <Table.Th>Term</Table.Th>
          <Table.Th>Start Date</Table.Th>
          <Table.Th>End Date</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        style={{
          cursor: 'pointer',
        }}
      >
        <Suspense fallback={<SuspendedAdminEnrollmentTableRows />}>
          <EnrollmentAdminQueryProvider props={props}>
            {(props) =>
              props.enrollmentPeriods.map((period) => (
                <Table.Tr
                  onClick={(e) =>
                    navigate({
                      to: '/enrollment/' + period.id,
                    })
                  }
                >
                  <Table.Td>
                    <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
                      {formatToSchoolYear(period.startYear, period.endYear)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={'dark.3'} fw={500}>
                      {period.term}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={'dark.3'} fw={500}>
                      {dayjs(period.startDate).format('MMM D, YYYY')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={'dark.3'} fw={500}>
                      {dayjs(period.endDate).format('MMM D, YYYY')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <EnrollmentBadgeStatus period={period} />
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
                          onClick={(e) => handleMenuAction(period.id, e).view()}
                        >
                          View Details
                        </Menu.Item>

                        <Menu.Item
                          leftSection={<IconPencil size={16} stroke={1.5} />}
                          onClick={(e) => handleMenuAction(period.id, e).edit()}
                        >
                          Edit
                        </Menu.Item>

                        <Menu.Item
                          leftSection={<IconTrash size={16} stroke={1.5} />}
                          onClick={(e) =>
                            handleMenuAction(period.id, e).delete()
                          }
                          c="red"
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            }
          </EnrollmentAdminQueryProvider>
        </Suspense>
      </Table.Tbody>
    </Table>
  )
}

export default EnrollmentAdminPage
