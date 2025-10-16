import { useAuth } from '@/features/auth/auth.hook'
import {
  transcriptControllerFindAllOptions,
  usersControllerFindAllOptions,
  enrollmentsControllerFindAllEnrollmentsOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatPaginationMessage } from '@/utils/formatters'
import {
  Box,
  Center,
  Container,
  Flex,
  Group,
  MultiSelect,
  rem,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { Suspense, useMemo, useState } from 'react'
import type { DetailedTranscriptDto, EnrollmentPeriodDto, UserWithRelations } from '@/integrations/api/client'

interface TranscriptQueryFilters {
  enrollmentPeriodId: string | null
  studentId: string | null
}

function EnrollmentPeriodsSelector({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const { data } = useSuspenseQuery(
    enrollmentsControllerFindAllEnrollmentsOptions({
      query: { page: 1, limit: 100 },
    }),
  )

  const enrollments = data?.enrollments ?? []
  const options = enrollments.map((enrollment: EnrollmentPeriodDto) => ({
    value: enrollment.id,
    label: `SY ${enrollment.startYear}-${enrollment.endYear} (Term ${enrollment.term})`,
  }))

  return (
    <Select
      label="Enrollment Period"
      placeholder="Select an enrollment period"
      data={options}
      value={value}
      onChange={onChange}
      searchable
      clearable
      radius={'md'}
    />
  )
}

function StudentSelector({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const { data } = useSuspenseQuery(
    usersControllerFindAllOptions({
      query: { search: '', page: 1, role: 'student' },
    }),
  )

  const students = data?.users ?? []
  const options = students.map((student: UserWithRelations) => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName}`,
  }))

  return (
    <Select
      label="Student"
      placeholder="Select a student"
      data={options}
      value={value}
      onChange={onChange}
      searchable
      clearable
      radius={'md'}
    />
  )
}

function TranscriptQueryProvider({
  filters,
  children,
}: {
  filters: TranscriptQueryFilters
  children: (data: DetailedTranscriptDto[]) => React.ReactNode
}) {
  const { authUser } = useAuth('protected')

  const { data } = useSuspenseQuery(
    transcriptControllerFindAllOptions({
      query: {
        enrollmentPeriodId: filters.enrollmentPeriodId || undefined,
        studentId:
          authUser.role === 'student'
            ? authUser.id
            : filters.studentId || undefined,
      },
    }),
  )

  const transcripts = data ?? []

  return children(transcripts)
}

function TranscriptTable({ transcripts }: { transcripts: DetailedTranscriptDto[] }) {
  if (transcripts.length === 0) {
    return (
      <Center py={rem(40)}>
        <Text fw={500} c={'dark.5'}>
          No transcripts found for the selected period and student.
        </Text>
      </Center>
    )
  }

  // Organize transcripts by term
  const groupedByTerm = useMemo(() => {
    const grouped: { [termLabel: string]: DetailedTranscriptDto[] } = {}

    transcripts.forEach((transcript) => {
      const termLabel = transcript.courseOffering?.enrollmentPeriod
        ? `SY ${transcript.courseOffering.enrollmentPeriod.startYear}-${transcript.courseOffering.enrollmentPeriod.endYear} (Term ${transcript.courseOffering.enrollmentPeriod.term})`
        : 'Unknown Term'

      if (!grouped[termLabel]) {
        grouped[termLabel] = []
      }
      grouped[termLabel].push(transcript)
    })

    return grouped
  }, [transcripts])

  return (
    <Stack gap={'lg'}>
      {Object.entries(groupedByTerm).map(([termLabel, termTranscripts]) => (
        <Box key={termLabel}>
          <Text fw={600} c={'dark.7'} mb={'md'} fz={'sm'}>
            {termLabel}
          </Text>

          <Table.ScrollContainer minWidth={rem(500)} type="native">
            <Table
              verticalSpacing={'sm'}
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
                  <Table.Th>Course Code</Table.Th>
                  <Table.Th>Course Name</Table.Th>
                  <Table.Th w={rem(80)}>Grade</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {termTranscripts.map((transcript) => (
                  <Table.Tr key={transcript.id}>
                    <Table.Td>
                      <Text fw={500} c={'dark.7'} fz={'sm'}>
                        {transcript.courseOffering?.course?.courseCode}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c={'dark.6'} fz={'sm'}>
                        {transcript.courseOffering?.course?.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} c={'dark.7'} fz={'sm'}>
                        {transcript.grade}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      ))}
    </Stack>
  )
}

function TranscriptPage() {
  const { authUser } = useAuth('protected')
  const [filters, setFilters] = useState<TranscriptQueryFilters>({
    enrollmentPeriodId: null,
    studentId: null,
  })

  const handleEnrollmentPeriodChange = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      enrollmentPeriodId: value,
    }))
  }

  const handleStudentChange = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      studentId: value,
    }))
  }

  return (
    <Container size={'md'} w="100%" pb={'xl'}>
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Transcript
        </Title>
        <Text c={'dark.3'} fw={500}>
          View and manage transcripts here.
        </Text>
      </Box>

      <Flex gap={'md'} direction={'column'}>
        <Stack gap={'md'}>
          <Group grow>
            <Suspense
              fallback={
                <Skeleton visible h={rem(40)} w="100%" radius={'md'} />
              }
            >
              <EnrollmentPeriodsSelector
                value={filters.enrollmentPeriodId}
                onChange={handleEnrollmentPeriodChange}
              />
            </Suspense>

            {authUser.role !== 'student' && (
              <Suspense
                fallback={
                  <Skeleton visible h={rem(40)} w="100%" radius={'md'} />
                }
              >
                <StudentSelector
                  value={filters.studentId}
                  onChange={handleStudentChange}
                />
              </Suspense>
            )}
          </Group>
        </Stack>

        <Suspense fallback={<Skeleton visible h={rem(200)} radius={'md'} />}>
          <TranscriptQueryProvider filters={filters}>
            {(transcripts) => <TranscriptTable transcripts={transcripts} />}
          </TranscriptQueryProvider>
        </Suspense>
      </Flex>
    </Container>
  )
}

export default TranscriptPage
