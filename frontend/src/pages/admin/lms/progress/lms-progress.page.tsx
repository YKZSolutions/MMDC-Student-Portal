import {
  lmsControllerGetModuleProgressDetailOptions,
  studentsControllerGetEnrolledStudentsOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import type { EnrolledStudentDto } from '@/integrations/api/client/types.gen'
import {
  Avatar,
  Box,
  Group,
  Progress,
  rem,
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

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/progress/')

interface StudentProgress {
  student: EnrolledStudentDto
  completedCount: number
  totalCount: number
  percentage: number
}

export default function LMSProgressPage() {
  const { lmsCode } = route.useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300)

  // Fetch enrolled students
  const { data: studentsData } = useSuspenseQuery(
    studentsControllerGetEnrolledStudentsOptions({
      path: {
        moduleId: lmsCode,
      },
      query: {
        courseOfferingId: undefined,
      },
    }),
  )

  const { students } = studentsData

  // Fetch progress data for the module
  const { data: progressDetail } = useSuspenseQuery(
    lmsControllerGetModuleProgressDetailOptions({
      path: {
        id: lmsCode,
      },
      query: {},
    }),
  )

  // Calculate total content items in the module
  const totalContentItems = useMemo(() => {
    let total = 0
    progressDetail.sections.forEach((section) => {
      total += section.totalContentItems
    })
    return total
  }, [progressDetail])

  // For demonstration, create student progress data
  // Note: In a real implementation, you'd need a backend endpoint
  // that returns per-student progress data
  const studentProgress = useMemo(() => {
    return students.map((student, index) => {
      // Mock data - in reality this should come from the backend
      const completedCount = Math.floor(Math.random() * (totalContentItems + 1))
      return {
        student,
        completedCount,
        totalCount: totalContentItems,
        percentage:
          totalContentItems > 0
            ? (completedCount / totalContentItems) * 100
            : 0,
      }
    })
  }, [students, totalContentItems])

  // Filter students based on search
  const filteredProgress = useMemo(() => {
    if (!debouncedSearch.trim()) return studentProgress

    const query = debouncedSearch.toLowerCase()
    return studentProgress.filter((prog) => {
      const fullName =
        `${prog.student.firstName} ${prog.student.lastName}`.toLowerCase()
      const studentNumber = prog.student.studentNumber?.toLowerCase() || ''
      return fullName.includes(query) || studentNumber.includes(query)
    })
  }, [studentProgress, debouncedSearch])

  // Sort by name
  const sortedProgress = useMemo(() => {
    return filteredProgress.sort((a, b) => {
      const nameA = `${a.student.lastName} ${a.student.firstName}`
      const nameB = `${b.student.lastName} ${b.student.firstName}`
      return nameA.localeCompare(nameB)
    })
  }, [filteredProgress])

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between" align="center">
        <Title c="dark.7" order={2} fw={700}>
          Student Progress
        </Title>
        <TextInput
          placeholder="Search students..."
          radius="md"
          leftSection={<IconSearch size={18} stroke={1.5} />}
          w={rem(280)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </Group>

      <ProgressTable progress={sortedProgress} />
    </Stack>
  )
}

function ProgressTable({ progress }: { progress: StudentProgress[] }) {
  if (progress.length === 0) {
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
            <Table.Th w="30%">Student</Table.Th>
            <Table.Th w="20%">Section</Table.Th>
            <Table.Th w="15%">Completed</Table.Th>
            <Table.Th w="35%">Progress</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {progress.map((prog) => (
            <ProgressRow key={prog.student.id} progress={prog} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

function ProgressRow({ progress }: { progress: StudentProgress }) {
  const { student, completedCount, totalCount, percentage } = progress

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
            <Text size="xs" c="dimmed">
              {student.studentNumber || student.id}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text fw={500}>{student.section?.name || 'N/A'}</Text>
      </Table.Td>

      <Table.Td>
        <Text fw={500}>
          {completedCount}/{totalCount}
        </Text>
        <Text size="xs" c="dimmed">
          modules
        </Text>
      </Table.Td>

      <Table.Td>
        <Text fw={500} mb={4}>
          {percentage.toFixed(1)}%
        </Text>
        <Progress value={percentage} size="sm" color="blue" />
      </Table.Td>
    </Table.Tr>
  )
}
