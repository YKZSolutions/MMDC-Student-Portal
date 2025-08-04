import { roleOptions, roleStyles } from '@/features/user-management/constants'
import type { IQuery } from '@/features/user-management/types'
import {
  type PaginationMetaDto,
  type Role,
  type UserWithRelations,
} from '@/integrations/api/client'
import { usersControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatPaginationMessage } from '@/utils/formatters'
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Flex,
  Group,
  Menu,
  Pagination,
  Pill,
  Popover,
  rem,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import {
  IconCancel,
  IconDotsVertical,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense, useState, type ReactNode } from 'react'
import { SuspendedPagination, SuspendedTableRows } from './users.admin.suspense'

function UsersQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    role: null,
  },
}: {
  children: (props: {
    users: UserWithRelations[]
    meta: PaginationMetaDto | undefined
    message: string
    totalPages: number
  }) => ReactNode
  props?: IQuery
}) {
  const { search, page, role } = props

  const { data } = useSuspenseQuery(
    usersControllerFindAllOptions({
      query: { search, page, ...(role && { role }) },
    }),
  )

  const users = data?.users ?? []
  const meta = data?.meta
  const limit = 10
  const total = meta?.totalCount ?? 0
  const totalPages = meta?.pageCount ?? 0

  const message = formatPaginationMessage({ limit, page, total })

  return children({
    users,
    meta,
    message,
    totalPages,
  })
}

function UsersPage() {
  const searchParam: {
    search: string
    role: Role | null
  } = useSearch({
    from: '/(protected)/users',
  })
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
    role: searchParam.role || null,
  }

  const [query, setQuery] = useState<IQuery>(queryDefaultValues)

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
      to: '/users',
      search: (prev) => ({
        ...prev,
        search: value.trim() || undefined,
      }),
    })
  }, 200)

  const handlePage = (page: IQuery['page']) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleRoleFilter = (role: IQuery['role']) => {
    setQuery((prev) => ({
      ...prev,
      role,
    }))

    navigate({
      to: '/users',
      search: (prev) => ({
        ...prev,
        role: role || undefined,
      }),
    })
  }

  return (
    <Container fluid m={0}>
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          User management
        </Title>
        <Text c={'dark.3'} fw={500}>
          Manage your team members and their account permissions here.
        </Text>
      </Box>

      <Flex gap={'md'} direction={'column'}>
        <Flex justify={'space-between'}>
          <Flex align={'center'} gap={'xs'}>
            <Title
              display={'flex'}
              c={'dark.7'}
              order={3}
              fw={700}
              lts={rem(0.4)}
            >
              All users
            </Title>

            <Suspense fallback={<Skeleton visible h={rem(30)} w={rem(40)} />}>
              <UsersQueryProvider>
                {(props) => (
                  <Title
                    display={'flex'}
                    order={3}
                    c={'dark.3'}
                    fw={700}
                    lts={rem(0.4)}
                  >
                    {props.meta?.totalCount}
                  </Title>
                )}
              </UsersQueryProvider>
            </Suspense>
          </Flex>

          <Flex align={'center'} gap={5}>
            <TextInput
              placeholder="Search"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={rem(250)}
              value={query.search}
              onChange={(e) => handleSearch(e)}
            />
            <Popover position="bottom" width={rem(300)}>
              <Popover.Target>
                <Button
                  variant="default"
                  radius={'md'}
                  leftSection={<IconFilter2 color="gray" size={20} />}
                  lts={rem(0.25)}
                >
                  Filters
                </Button>
              </Popover.Target>
              <Popover.Dropdown bg="var(--mantine-color-body)">
                <Stack>
                  <Flex justify={'space-between'}>
                    <Title fw={500} c={'dark.8'} order={4}>
                      Filter Users
                    </Title>

                    <UnstyledButton
                      styles={{
                        root: {
                          textDecoration: 'underline',
                        },
                      }}
                      c={'primary'}
                      onClick={() => setQuery(queryDefaultValues)}
                    >
                      Reset Filter
                    </UnstyledButton>
                  </Flex>

                  <Stack gap={'xs'}>
                    <Text fw={500} c={'gray.7'} fz={'sm'}>
                      Role
                    </Text>
                    <Flex
                      justify={'space-between'}
                      w={'100%'}
                      wrap={'wrap'}
                      gap={'sm'}
                    >
                      {roleOptions.map((role) => (
                        <Button
                          className="flex-[47%]"
                          key={role.value}
                          variant={
                            query.role === role.value ? 'filled' : 'outline'
                          }
                          styles={{
                            root: {
                              background:
                                query.role === role.value
                                  ? 'var(--mantine-color-gray-3)'
                                  : 'transparent',
                              borderColor: 'var(--mantine-color-gray-3)',
                              color: 'var(--mantine-color-dark-7)',
                            },
                          }}
                          radius={'xl'}
                          leftSection={role.icon}
                          onClick={() => handleRoleFilter(role.value)}
                        >
                          {role.label}
                        </Button>
                      ))}
                    </Flex>
                  </Stack>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <Button
              variant="filled"
              radius={'md'}
              leftSection={<IconPlus size={20} />}
              lts={rem(0.25)}
            >
              Add user
            </Button>
          </Flex>
        </Flex>

        <UsersTable props={query} />

        <Suspense fallback={<SuspendedPagination />}>
          <UsersQueryProvider props={query}>
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
          </UsersQueryProvider>
        </Suspense>
      </Flex>
    </Container>
  )
}

function UsersTable({ props }: { props: IQuery }) {
  return (
    <Table
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
          <Table.Th w={0}>
            <Checkbox py={rem(5)} />
          </Table.Th>
          <Table.Th>User</Table.Th>
          <Table.Th>Access</Table.Th>
          <Table.Th>Date Added</Table.Th>
          <Table.Th w={0}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Suspense fallback={<SuspendedTableRows />}>
          <UsersQueryProvider props={props}>
            {(props) => <UsersTableRow users={props.users} />}
          </UsersQueryProvider>
        </Suspense>
      </Table.Tbody>
    </Table>
  )
}

function UsersRolePill({ role }: { role: Role }) {
  const { border, backgroundColor, color } = roleStyles[role]

  return (
    <Pill
      styles={{
        root: {
          border,
          backgroundColor,
          color,
          fontWeight: 600,
          textTransform: 'capitalize',
        },
      }}
    >
      {role}
    </Pill>
  )
}

function UsersTableRow({ users }: { users: UserWithRelations[] }) {
  if (users.length === 0)
    return (
      <Table.Tr>
        <Table.Td colSpan={5}>
          <Center py={rem(10)}>
            <Text fw={500} c={'dark.5'}>
              No matching users found.
            </Text>
          </Center>
        </Table.Td>
      </Table.Tr>
    )

  return users.map((user: UserWithRelations) => (
    <>
      <Table.Tr key={user.id}>
        <Table.Td>
          <Checkbox />
        </Table.Td>
        <Table.Td>
          <Flex gap={'sm'} align={'center'} py={rem(5)}>
            <Avatar name={`${user.firstName} ${user.lastName}`} />
            <Flex direction={'column'}>
              <Text fw={600}>
                {user.firstName} {user.lastName}
              </Text>
              <Text fz={'sm'} fw={500} c={'dark.2'}>
                {user.userAccount?.email}
              </Text>
            </Flex>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex gap={'xs'}>
            <UsersRolePill role={user.role} />
          </Flex>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c={'dark.3'} fw={500}>
            {dayjs(user.createdAt).format('MMM D, YYYY')}
          </Text>
        </Table.Td>
        <Table.Td>
          <Menu position="bottom-end" shadow="xl" width={rem(200)} withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius={'xl'}>
                <IconDotsVertical size={20} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPencil size={14} />}>
                Edit details
              </Menu.Item>

              <Menu.Item leftSection={<IconCancel size={14} />}>
                Disable
              </Menu.Item>

              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    </>
  ))
}

export default UsersPage
