import SupabaseAvatar from '@/components/supabase-avatar'
import { SuspendedPagination } from '@/components/suspense-pagination'
import { roleOptions, roleStyles } from '@/features/user-management/constants'
import { SuspendedUserTableRows } from '@/features/user-management/suspense'
import type { IUsersQuery } from '@/features/user-management/types'
import { useSearchState } from '@/hooks/use-search-state'
import {
  type PaginationMetaDto,
  type Role,
  type UserWithRelations,
} from '@/integrations/api/client'
import {
  usersControllerFindAllOptions,
  usersControllerFindAllQueryKey,
  usersControllerRemoveMutation,
  usersControllerUpdateUserStatusMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import type { UsersSearchSchemaType } from '@/routes/(protected)/users'
import { formatPaginationMessage } from '@/utils/formatters'
import {
  ActionIcon,
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
import { useDebouncedValue } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCancel,
  IconCheck,
  IconDotsVertical,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense, type ReactNode } from 'react'

const route = getRouteApi('/(protected)/users/')

function UsersQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    role: undefined,
  },
}: {
  children: (props: {
    users: UserWithRelations[]
    meta: PaginationMetaDto | undefined
    message: string
    totalPages: number
  }) => ReactNode
  props?: UsersSearchSchemaType
}) {
  const { search, page, role } = props

  const [debouncedSearch] = useDebouncedValue(search, 200)

  const { data } = useSuspenseQuery(
    usersControllerFindAllOptions({
      query: { search: debouncedSearch, page, ...(role && { role }) },
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
  const { search, setDebouncedSearch } = useSearchState(route)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setDebouncedSearch({ search: value || undefined })
  }

  const handlePage = (page: IUsersQuery['page']) => {
    setDebouncedSearch({ page: page })
  }

  const handleRoleFilter = (role: IUsersQuery['role']) => {
    setDebouncedSearch({ role: role || undefined, page: 1 })
  }

  const handleResetFilter = () => {
    setDebouncedSearch({ role: undefined, page: undefined })
  }

  return (
    <Container size={'md'} w="100%" pb={'xl'}>
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          User management
        </Title>
        <Text c={'dark.3'} fw={500}>
          Manage users and their account permissions here.
        </Text>
      </Box>

      <Flex gap={'md'} direction={'column'}>
        <Group>
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

          <Flex
            wrap={'wrap'}
            w={{
              base: '100%',
              xs: 'auto',
            }}
            align={'center'}
            gap={5}
            ml={'auto'}
          >
            <TextInput
              placeholder="Search name/email"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={{
                base: '100%',
                xs: rem(250),
              }}
              value={search.search}
              onChange={(e) => handleSearch(e)}
            />
            <Popover position="bottom" width={rem(300)}>
              <Popover.Target>
                <Button
                  variant="default"
                  radius={'md'}
                  leftSection={<IconFilter2 color="gray" size={20} />}
                  lts={rem(0.25)}
                  w={{
                    base: '100%',
                    xs: 'auto',
                  }}
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
                      onClick={() => handleResetFilter()}
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
                            search.role === role.value ? 'filled' : 'outline'
                          }
                          styles={{
                            root: {
                              background:
                                search.role === role.value
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
              data-cy="add-user-button"
              variant="filled"
              radius={'md'}
              leftSection={<IconPlus size={20} />}
              lts={rem(0.25)}
              onClick={() =>
                modals.openContextModal({
                  modal: 'putUser',
                  size: 520,
                  title: (
                    <Text size="lg" fw={500}>
                      Add User
                    </Text>
                  ),
                  innerProps: {},
                })
              }
              w={{
                base: '100%',
                xs: 'auto',
              }}
            >
              Add user
            </Button>
          </Flex>
        </Group>

        <UsersTable props={search} />

        <Suspense fallback={<SuspendedPagination />}>
          <UsersQueryProvider props={search}>
            {(props) => (
              <Group justify="flex-end">
                <Text size="sm">{props.message}</Text>
                <Pagination
                  total={props.totalPages}
                  value={search.page}
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

function UsersTable({ props }: { props: UsersSearchSchemaType }) {
  return (
    <Table.ScrollContainer minWidth={rem(600)} type="native">
      <Table
        verticalSpacing={'sm'}
        data-cy="users-table"
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
          <Suspense fallback={<SuspendedUserTableRows />}>
            <UsersQueryProvider props={props}>
              {(props) => <UsersTableRow users={props.users} />}
            </UsersQueryProvider>
          </Suspense>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
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
  const { mutateAsync: disabled } = useMutation({
    ...usersControllerUpdateUserStatusMutation(),
    onSettled: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      })
    },
  })

  const { mutateAsync: remove } = useMutation({
    ...usersControllerRemoveMutation(),
    onSettled: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      })
    },
  })

  const handleDisable = async (id: string, isDisabled: boolean) => {
    const notifId = notifications.show({
      loading: true,
      title: `${isDisabled ? 'Enabling' : 'Disabling'} the user`,
      message: `Performing the action, please wait`,
      autoClose: false,
      withCloseButton: false,
    })
    await disabled({
      path: {
        id: id,
      },
    })
    notifications.update({
      id: notifId,
      color: 'teal',
      title: `User ${isDisabled ? 'Enabled' : 'Disabled'}`,
      message: `The user's account has been ${isDisabled ? 'enabled' : 'disabled'}`,
      icon: <IconCheck size={18} />,
      loading: false,
      autoClose: 1500,
    })
  }

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete this user?',
      children: (
        <Text size="sm">Are you sure you wan't to delete this user?</Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', 'data-cy': 'confirm-delete-button' },
      onConfirm: async () => {
        const notifId = notifications.show({
          loading: true,
          title: `Deleting the user`,
          message: `Performing the action, please wait`,
          autoClose: false,
          withCloseButton: false,
        })
        await remove({
          path: {
            id: id,
          },
          query: {
            directDelete: true,
          },
        })
        notifications.update({
          id: notifId,
          color: 'teal',
          title: `User Deleted`,
          message: `The user and their account has been deleted`,
          icon: <IconCheck size={18} />,
          loading: false,
          autoClose: 1500,
        })
      },
    })
  }

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
    <Table.Tr key={user.id}>
      <Table.Td>
        <Checkbox />
      </Table.Td>
      <Table.Td>
        <Flex gap={'sm'} align={'center'}>
          <SupabaseAvatar
            bucket={SupabaseBuckets.USER_AVATARS}
            path={user.id}
            imageType="jpg"
            name={`${user.firstName} ${user.lastName}`}
          />
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
            <ActionIcon
              variant="subtle"
              color="gray"
              radius={'xl'}
              data-cy="user-actions-button"
            >
              <IconDotsVertical size={20} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={14} />}>
              Edit details
            </Menu.Item>

            <Menu.Item
              leftSection={
                user.disabledAt !== null ? (
                  <IconCheck size={14} />
                ) : (
                  <IconCancel size={14} />
                )
              }
              onClick={() => handleDisable(user.id, user.disabledAt !== null)}
            >
              {user.disabledAt !== null ? 'Enable' : 'Disable'}
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => handleDelete(user.id)}
              data-cy="delete-user-menu-item"
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ))
}

export default UsersPage
