import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Group,
  Menu,
  Pagination,
  Pill,
  rem,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconCancel,
  IconDotsVertical,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'

function UsersPage() {
  const limit = 10
  const total = 145
  const totalPages = Math.ceil(total / limit)

  const [page, setPage] = useState(1)
  const message = `Showing ${limit * (page - 1) + 1} – ${Math.min(total, limit * page)} of ${total}`

  return (
    <Container size={'xl'} my={'md'}>
      <Box pb={'xl'}>
        <Title opacity={'80%'} order={2} fw={700}>
          User management
        </Title>
        <Text opacity={'60%'} fw={500}>
          Manage your team members and their account permissions here.
        </Text>
      </Box>

      <Flex gap={'sm'} direction={'column'}>
        <Flex justify={'space-between'}>
          <Flex align={'center'} gap={'xs'}>
            <Title
              display={'flex'}
              opacity={'80%'}
              order={3}
              fw={700}
              lts={rem(0.4)}
            >
              All users
            </Title>
            <Title
              display={'flex'}
              order={3}
              opacity={'50%'}
              fw={700}
              lts={rem(0.4)}
            >
              44
            </Title>
          </Flex>

          <Flex align={'center'} gap={5}>
            <TextInput
              placeholder="Search"
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

        <UsersTable />

        <Group justify="flex-end">
          <Text size="sm">{message}</Text>
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            withPages={false}
          />
        </Group>
      </Flex>
    </Container>
  )
}

const userData = [
  {
    id: 1,
    name: 'Florence Shaw',
    email: 'florence@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1508214751196-c93f4e24c4e5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    access: ['Admin', 'Data Export', 'Data Import'],
    lastActive: 'Mar 4, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 2,
    name: 'Amélie Laurent',
    email: 'amelie@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1586297135537-94bc8ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80',
    access: ['Admin', 'Data Export', 'Data Import'],
    lastActive: 'Mar 4, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 3,
    name: 'Ammar Foley',
    email: 'ammar@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1543610892-0b1f7e6b8ac6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 2, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 4,
    name: 'Caitlyn King',
    email: 'caitlyn@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 6, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 5,
    name: 'Sienna Hewitt',
    email: 'sienna@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 8, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 6,
    name: 'Olly Shroeder',
    email: 'olly@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1519345182560-2f2917c47671?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 6, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 7,
    name: 'Mathilde Lewis',
    email: 'mathilde@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 4, 2024',
    dateAdded: 'July 4, 2022',
  },
  {
    id: 8,
    name: 'Jaya Willis',
    email: 'jaya@untitledui.com',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80',
    access: ['Data Export', 'Data Import'],
    lastActive: 'Mar 4, 2024',
    dateAdded: 'July 4, 2022',
  },
]

function UsersTable() {
  return (
    <Table
      highlightOnHover
      highlightOnHoverColor="var(--mantine-color-gray-0)"
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
            background: 'var(--mantine-color-gray-1)',
            border: '0px',
          }}
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
        {userData.map((data) => (
          <Table.Tr key={data.id}>
            <Table.Td>
              <Checkbox />
            </Table.Td>
            <Table.Td>
              <Flex gap={'sm'} align={'center'} py={rem(5)}>
                <Avatar name={data.name} src={data.avatar} />
                <Flex direction={'column'}>
                  <Text fw={600}>{data.name}</Text>
                  <Text fz={'sm'} fw={500} opacity={'50%'}>
                    {data.email}
                  </Text>
                </Flex>
              </Flex>
            </Table.Td>
            <Table.Td>
              <Flex gap={'xs'}>
                {data.access.map((access) => (
                  <Pill
                    styles={{
                      root: {
                        border: '1px solid var(--mantine-color-blue-9)',
                        backgroundColor: 'var(--mantine-color-blue-1)',
                      },
                    }}
                  >
                    <Text size="xs" c={'var(--mantine-color-blue-9)'} fw={500}>
                      {access}
                    </Text>
                  </Pill>
                ))}
              </Flex>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c={'var(--mantine-color-gray-8)'}>
                {data.dateAdded}
              </Text>
            </Table.Td>
            <Table.Td>
              <Menu
                position="bottom-end"
                shadow="xl"
                width={rem(200)}
                withArrow
              >
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
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default UsersPage
