import type { IUsersQuery } from '@/features/user-management/types.ts'
import {
  Badge,
  Button,
  Center,
  Flex,
  Group,
  rem,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Suspense, useState } from 'react'
import { SuspendedTableRows } from '@/pages/admin/users/users.admin.suspense.tsx'
import SupabaseAvatar from '@/components/supabase-avatar.tsx'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket.ts'
import dayjs from 'dayjs'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SearchComponent from '@/components/search-component.tsx'
import type { Grade } from '@/features/courses/grades/types.ts'
import type { StudentAssignment } from '@/features/courses/assignments/types.ts'
import { mockAssignmentsData } from '@/pages/shared/courses/$courseId/assignments/course-assignments.tsx'

const CourseGrades = () => {
  const grades = mockAssignmentsData
  const [filteredItems, setFilteredItems] = useState<StudentAssignment[]>(grades)

  return (
    <Stack gap={'md'}>
      <Group justify="space-between" align="start">
        <Title>Grades</Title>
      </Group>
      <Group justify="space-between" align="start">
        <SearchComponent data={grades} onFilter={setFilteredItems} identifiers={['title', 'type', /*'submittedBy'*/]} placeholder={'Search...'} />
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

function GradesTable({grades}: { grades: StudentAssignment[] }) {
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
          {/*<Table.Th>Submitted By</Table.Th>*/}
          {/*<Table.Th>Group</Table.Th>*/}
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

function GradesTableRow({ grades }: { grades: StudentAssignment[] }) {
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
        <Text >{item.title}</Text>
      </Table.Td>
      <Table.Td>
        <Text >{item.type}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {formatTimestampToDateTimeText(item.dueDate, 'by')}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={'dark.3'} fw={500}>
          {formatTimestampToDateTimeText(item.submissionTimestamp!)}
        </Text>
      </Table.Td>
      {/*<Table.Td>*/}
      {/*  <Flex gap={'sm'} align={'center'} py={rem(5)}>*/}
      {/*    <SupabaseAvatar*/}
      {/*      bucket={SupabaseBuckets.USER_AVATARS}*/}
      {/*      path={item.id}*/}
      {/*      imageType="jpg"*/}
      {/*      name={`${item.submittedBy}`}*/}
      {/*    />*/}
      {/*    <Flex direction={'column'}>*/}
      {/*      <Text fw={600}>*/}
      {/*        {item.submittedBy}*/}
      {/*      </Text>*/}
      {/*    </Flex>*/}
      {/*  </Flex>*/}
      {/*</Table.Td>*/}
      {/*<Table.Td>*/}
      {/*  <Text size="sm" c={'dark.3'} fw={500}>*/}
      {/*    {item.group}*/}
      {/*  </Text>*/}
      {/*</Table.Td>*/}
      <Table.Td>
        <Badge
          color={item.submissionStatus}
          variant="outline"
          size="sm"
        >
          {item.submissionStatus}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="md" c={'dark.3'} fw={500}>
          {item.grade?.score ?? '-'} / {item.grade?.maxScore}
        </Text>
      </Table.Td>
    </Table.Tr>
  ))
}

export default CourseGrades
