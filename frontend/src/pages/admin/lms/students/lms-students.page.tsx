import { studentsControllerGetEnrolledStudentsOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { EnrolledStudentDto } from '@/integrations/api/client/types.gen'
import {
  Avatar,
  Badge,
  Box,
  Group,
  rem,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/students/')

type GroupingMode = 'all' | 'by-section'

export default function LMSStudentsPage() {
  const { lmsCode } = route.useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300)
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('all')

  const { data } = useSuspenseQuery(
    studentsControllerGetEnrolledStudentsOptions({
      path: {
        moduleId: lmsCode,
      },
      query: {
        courseOfferingId: undefined,
      },
    }),
  )

  const { students } = data

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!debouncedSearch.trim()) return students

    const query = debouncedSearch.toLowerCase()
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
      const studentId = student.id.toLowerCase()
      const sectionName = student.section?.name?.toLowerCase() || ''
      const mentorName = student.section?.mentorName?.toLowerCase() || ''
      return (
        fullName.includes(query) ||
        studentId.includes(query) ||
        sectionName.includes(query) ||
        mentorName.includes(query)
      )
    })
  }, [students, debouncedSearch])

  // Sort by name
  const sortedStudents = useMemo(() => {
    return filteredStudents.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`
      const nameB = `${b.lastName} ${b.firstName}`
      return nameA.localeCompare(nameB)
    })
  }, [filteredStudents])

  // Group students by section
  const groupedBySection = useMemo(() => {
    const groups = new Map<string, EnrolledStudentDto[]>()

    sortedStudents.forEach((student) => {
      const sectionKey = student.section?.name || 'No Section'
      if (!groups.has(sectionKey)) {
        groups.set(sectionKey, [])
      }
      groups.get(sectionKey)!.push(student)
    })

    // Sort sections alphabetically
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [sortedStudents])

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between" align="center">
        <Title c="dark.7" order={2} fw={700}>
          Students
        </Title>
        <Group gap="md">
          <SegmentedControl
            value={groupingMode}
            onChange={(value) => setGroupingMode(value as GroupingMode)}
            data={[
              { label: 'All Students', value: 'all' },
              { label: 'Group by Section', value: 'by-section' },
            ]}
          />
          <TextInput
            placeholder="Search students..."
            radius="md"
            leftSection={<IconSearch size={18} stroke={1.5} />}
            w={rem(280)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </Group>
      </Group>

      {groupingMode === 'all' ? (
        <StudentsTable students={sortedStudents} />
      ) : (
        <GroupedStudentsTables sections={groupedBySection} />
      )}
    </Stack>
  )
}

function StudentsTable({ students }: { students: EnrolledStudentDto[] }) {
  if (students.length === 0) {
    return (
      <Box
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: rem(8),
          padding: rem(32),
          textAlign: 'center',
        }}
      >
        <Text c="dimmed">No students found</Text>
      </Box>
    )
  }

  return (
    <Table.ScrollContainer minWidth={rem(800)}>
      <Table
        highlightOnHover
        style={{ borderRadius: rem(8), overflow: 'hidden' }}
        verticalSpacing="lg"
      >
        <Table.Thead>
          <Table.Tr
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
            }}
            bg="gray.1"
            c="dark.5"
          >
            <Table.Th>Student</Table.Th>
            <Table.Th>Student ID</Table.Th>
            <Table.Th>Section</Table.Th>
            <Table.Th>Mentor</Table.Th>
            <Table.Th>Role</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {students.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

function StudentRow({ student }: { student: EnrolledStudentDto }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'mentor':
        return 'blue'
      case 'student':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="primary" radius="xl">
            {getInitials(student.firstName, student.lastName)}
          </Avatar>
          <Box>
            <Text fw={500}>
              {student.firstName}{' '}
              {student.middleName ? `${student.middleName} ` : ''}
              {student.lastName}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dark.4">
          {student.studentNumber || student.id}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text fw={500}>{student.section?.name || 'N/A'}</Text>
      </Table.Td>

      <Table.Td>
        <Text fw={500}>
          {student.section?.mentorName || 'No Mentor Assigned'}
        </Text>
        {student.section?.mentorEmployeeNumber && (
          <Text size="xs" c="dimmed">
            Employee #: {student.section.mentorEmployeeNumber}
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Badge color={getRoleBadgeColor(student.role)} variant="light">
          {student.role.charAt(0).toUpperCase() + student.role.slice(1)}
        </Badge>
      </Table.Td>
    </Table.Tr>
  )
}

function GroupedStudentsTables({
  sections,
}: {
  sections: [string, EnrolledStudentDto[]][]
}) {
  if (sections.length === 0) {
    return (
      <Box
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: rem(8),
          padding: rem(32),
          textAlign: 'center',
        }}
      >
        <Text c="dimmed">No students found</Text>
      </Box>
    )
  }

  return (
    <Stack gap="xl">
      {sections.map(([sectionName, students]) => (
        <Box key={sectionName}>
          <Group mb="md" gap="sm">
            <Title order={4} c="dark.6">
              {sectionName}
            </Title>
            <Badge variant="light" size="lg">
              {students.length} {students.length === 1 ? 'student' : 'students'}
            </Badge>
            {students[0]?.section?.mentorName && (
              <Text size="sm" c="dimmed">
                Mentor: {students[0].section.mentorName}
                {students[0].section.mentorEmployeeNumber &&
                  ` (#${students[0].section.mentorEmployeeNumber})`}
              </Text>
            )}
          </Group>

          <Table.ScrollContainer minWidth={rem(800)}>
            <Table
              highlightOnHover
              style={{ borderRadius: rem(8), overflow: 'hidden' }}
              verticalSpacing="lg"
            >
              <Table.Thead>
                <Table.Tr
                  style={{
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                  }}
                  bg="gray.1"
                  c="dark.5"
                >
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Student ID</Table.Th>
                  <Table.Th>Role</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {students.map((student) => (
                  <GroupedStudentRow key={student.id} student={student} />
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      ))}
    </Stack>
  )
}

function GroupedStudentRow({ student }: { student: EnrolledStudentDto }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'mentor':
        return 'blue'
      case 'student':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="primary" radius="xl">
            {getInitials(student.firstName, student.lastName)}
          </Avatar>
          <Box>
            <Text fw={500}>
              {student.firstName}{' '}
              {student.middleName ? `${student.middleName} ` : ''}
              {student.lastName}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dark.4">
          {student.studentNumber || student.id}
        </Text>
      </Table.Td>

      <Table.Td>
        <Badge color={getRoleBadgeColor(student.role)} variant="light">
          {student.role.charAt(0).toUpperCase() + student.role.slice(1)}
        </Badge>
      </Table.Td>
    </Table.Tr>
  )
}
