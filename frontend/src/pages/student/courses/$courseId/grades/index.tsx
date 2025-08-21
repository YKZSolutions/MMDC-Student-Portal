import type { IUsersQuery } from '@/features/user-management/types.ts'
import { Checkbox, Group, rem, Stack, Table, Title } from '@mantine/core'
import { Suspense } from 'react'
import { SuspendedTableRows } from '@/pages/admin/users/users.admin.suspense.tsx'

const GradesPageStudentView = () => {
  return (
    <Stack gap={'md'}>
      <Group justify="space-between" align="start">
        <Title>Grades</Title>
      </Group>
      <GradesTable></GradesTable>
    </Stack>
  )
}

export default GradesPageStudentView

function GradesTable() {
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
          {/*<UsersQueryProvider props={props}>*/}
          {/*  {(props) => <UsersTableRow users={props.users} />}*/}
          {/*</UsersQueryProvider>*/}
        </Suspense>
      </Table.Tbody>
    </Table>
  )
}