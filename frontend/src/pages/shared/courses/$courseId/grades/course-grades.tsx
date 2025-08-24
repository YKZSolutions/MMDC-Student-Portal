import type { IUsersQuery } from '@/features/user-management/types.ts'
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Flex,
  Group,
  Menu,
  Pill,
  rem,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Suspense, useState } from 'react'
import { SuspendedTableRows } from '@/pages/admin/users/users.admin.suspense.tsx'
import type { UserWithRelations } from '@/integrations/api/client'
import { useMutation } from '@tanstack/react-query'
import {
  usersControllerFindAllQueryKey,
  usersControllerRemoveMutation,
  usersControllerUpdateUserStatusMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import { getContext } from '@/integrations/tanstack-query/root-provider.tsx'
import { notifications } from '@mantine/notifications'
import { IconCancel, IconCheck, IconDotsVertical, IconFilter2, IconPencil, IconTrash } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import SupabaseAvatar from '@/components/supabase-avatar.tsx'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket.ts'
import dayjs from 'dayjs'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SearchComponent from '@/components/search-component.tsx'

const mockGrades: GradesData[] = [
  {
    id: '1',
    name: 'Assignment 1',
    type: 'assignment',
    dueTimestamp: '2023-01-01T00:00:00Z',
    submissionTimestamp: '2023-01-01T00:00:00Z',
    submittedBy: 'John Doe',
    group: 'Group A',
    status: 'graded',
    grade: '18',
    maxGrade: '20',
  },
  {
    id: '2',
    name: 'Assignment 2',
    type: 'assignment',
    dueTimestamp: '2023-01-01T00:00:00Z',
    submissionTimestamp: '2023-01-01T00:00:00Z',
    submittedBy: 'John Doe',
    group: 'Individual',
    status: 'graded',
    grade: '20',
    maxGrade: '20',
  },
  {
    id: '3',
    name: 'Draft Milestone 1',
    type: 'draft',
    dueTimestamp: '2023-01-01T00:00:00Z',
    submissionTimestamp: '2023-01-01T00:00:00Z',
    submittedBy: 'John Doe',
    group: 'Individual',
    status: 'submitted',
    maxGrade: '100',
  },
  {
    id: '4',
    name: 'Milestone 1',
    type: 'milestone',
    dueTimestamp: '2023-01-01T00:00:00Z',
    submissionTimestamp: '2023-01-01T00:00:00Z',
    submittedBy: 'John Doe',
    group: 'Individual',
    status: 'late',
    maxGrade: '100',
  },
]

const CourseGrades = () => {
  const grades = mockGrades
  const [filteredItems, setFilteredItems] = useState<GradesData[]>(grades)

  return (
    <Stack gap={'md'}>
      <Group justify="space-between" align="start">
        <Title>Grades</Title>
      </Group>
      <Group justify="space-between" align="start">
        <SearchComponent data={grades} onFilter={setFilteredItems} identifiers={['name', 'type', 'submittedBy']} placeholder={'Search...'} />
        <Group gap={rem(5)} justify="end" align="center">
          <Button
            variant="default"
            radius={'md'}
            // leftSection={<IconFilter2 color="gray" size={20} />}
          >
            Filters (to include)
          </Button>
        </Group>
      </Group>
      <GradesTable grades={filteredItems}></GradesTable>
    </Stack>
  )
}

function GradesTable({grades}: { grades: GradesData[] }) {
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
          <Table.Th>Name</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Due</Table.Th>
          <Table.Th>Submitted At</Table.Th>
          <Table.Th>Submitted By</Table.Th>
          <Table.Th>Group</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Grade</Table.Th>
          <Table.Th w={0}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Suspense fallback={<SuspendedTableRows />}>
          <GradesTableRow grades={grades} />
        </Suspense>
      </Table.Tbody>
    </Table>
  )
}

function GradesTableRow({ grades }: { grades: GradesData[] }) {
  if (grades.length === 0)
    return (
      <Table.Tr>
        <Table.Td colSpan={5}>
          <Center py={rem(10)}>
            <Text fw={500} c={'dark.5'}>
              No matching records found.
            </Text>
          </Center>
        </Table.Td>
      </Table.Tr>
    )

  return grades.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text >{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text >{item.type}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {formatTimestampToDateTimeText(item.dueTimestamp, 'by')}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {formatTimestampToDateTimeText(item.submissionTimestamp)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Flex gap={'sm'} align={'center'} py={rem(5)}>
          <SupabaseAvatar
            bucket={SupabaseBuckets.USER_AVATARS}
            path={item.id}
            imageType="jpg"
            name={`${item.submittedBy}`}
          />
          <Flex direction={'column'}>
            <Text fw={600}>
              {item.submittedBy}
            </Text>
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {item.group}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.status}
          variant="outline"
          size="sm"
        >
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="md" c={'dark.3'} fw={500}>
          {item.grade ? item.grade : '-'} / {item.maxGrade}
        </Text>
      </Table.Td>
    </Table.Tr>
  ))
}

export default CourseGrades
