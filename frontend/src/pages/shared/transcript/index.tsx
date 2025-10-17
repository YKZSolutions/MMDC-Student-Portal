import AsyncSearchSelect from '@/components/async-search-select'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { useSearchState } from '@/hooks/use-search-state'
import {
  type DetailedTranscriptDto,
  type EnrollmentPeriodDto,
  type UserWithRelations,
} from '@/integrations/api/client'
import {
  enrollmentControllerFindAllEnrollmentsOptions,
  enrollmentControllerFindOneEnrollmentOptions,
  transcriptControllerFindAllOptions,
  usersControllerFindAllOptions,
  usersControllerFindOneOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import type { TranscriptSearch } from '@/routes/(protected)/transcript'
import { formatEnrollmentToFullLabel } from '@/utils/formatters'
import {
  ActionIcon,
  Box,
  Center,
  Container,
  Flex,
  Group,
  Menu,
  Paper,
  rem,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import React, { Suspense } from 'react'

const route = getRouteApi('/(protected)/transcript/')

/**
 * @param children - Child components that will receive the transcript data.
 * @param props - Optional props to override default behavior.
 *
 * @returns
 * Retrieves transcripts based on filters and provides them to child components.
 */
function TranscriptQueryProvider({
  children,
  props,
}: {
  children: (data: DetailedTranscriptDto[]) => React.ReactNode
  props?: {
    filters?: TranscriptSearch
  }
}) {
  const { search } = useSearchState(route)
  const filters = props?.filters ?? {
    enrollmentPeriodId: search.enrollmentPeriodId || undefined,
    studentId: search.studentId || undefined,
  }

  const { authUser } = useAuth('protected')

  const { data } = useSuspenseQuery({
    ...transcriptControllerFindAllOptions({
      query: {
        enrollmentPeriodId: filters?.enrollmentPeriodId || undefined,
        studentId:
          (authUser.role !== 'student' && filters?.studentId) || undefined,
      },
    }),
  })

  const transcripts = data ?? []

  return children(transcripts)
}

/**
 *
 * @param children - Child components that will receive the enrollment period data.
 * @param props - Optional props to override default behavior.
 *
 *
 * @returns
 * Retrieves a specific enrollment period by its ID and provides it to child components.
 */
function EnrollmentPeriodQueryProvider({
  children,
  props,
}: {
  children: (data: EnrollmentPeriodDto) => React.ReactNode
  props?: {
    enrollmentPeriodId: EnrollmentPeriodDto['id']
  }
}) {
  const { search } = useSearchState(route)

  const enrollmentPeriodId =
    props?.enrollmentPeriodId ?? (search.enrollmentPeriodId || undefined)

  const { data } = useSuspenseQuery({
    ...enrollmentControllerFindOneEnrollmentOptions({
      path: {
        enrollmentId: enrollmentPeriodId || '',
      },
    }),
  })

  const enrollments = data ?? []

  return children(enrollments)
}

function TranscriptPage() {
  const { authUser } = useAuth('protected')

  const { setSearch } = useSearchState(route)

  const handleEnrollmentPeriodChange = (value: string | null) => {
    const enrollmentPeriodId = value ?? undefined

    setSearch({ enrollmentPeriodId })
  }

  const handleStudentChange = (value: string | null) => {
    const studentId = value ?? undefined
    setSearch({ studentId })
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
          <Group>
            <Suspense
              fallback={
                // This skeleton mimics the AsyncSearchSelect appearance
                // to maintain layout consistency during loading.
                <EnrollmentPeriodsSelector
                  onChange={handleEnrollmentPeriodChange}
                  transcripts={[]}
                />
              }
            >
              <TranscriptQueryProvider>
                {(transcripts) => (
                  <EnrollmentPeriodsSelector
                    transcripts={transcripts}
                    onChange={handleEnrollmentPeriodChange}
                  />
                )}
              </TranscriptQueryProvider>
            </Suspense>

            {authUser.role !== 'student' && (
              <Suspense
                fallback={
                  <StudentSelector
                    onChange={handleStudentChange}
                    transcripts={[]}
                  />
                }
              >
                <TranscriptQueryProvider>
                  {(transcripts) => (
                    <StudentSelector
                      onChange={handleStudentChange}
                      transcripts={transcripts}
                    />
                  )}
                </TranscriptQueryProvider>
              </Suspense>
            )}
          </Group>
        </Stack>

        <Suspense fallback={<Skeleton visible h={rem(200)} radius={'md'} />}>
          <TranscriptQueryProvider>
            {(transcripts) => <TranscriptTable transcripts={transcripts} />}
          </TranscriptQueryProvider>
        </Suspense>
      </Flex>
    </Container>
  )
}

function TranscriptTable({
  transcripts,
}: {
  transcripts: DetailedTranscriptDto[]
}) {
  const { authUser } = useAuth('protected')

  if (transcripts.length === 0) {
    return (
      <Center py={rem(40)}>
        <Text fw={500} c={'dark.5'}>
          No transcripts found for the selected period and student.
        </Text>
      </Center>
    )
  }

  const enrollmentPeriodId = transcripts[0].courseOffering.enrollmentPeriod.id

  return (
    <Stack gap={'lg'}>
      <Paper withBorder radius={'md'}>
        <EnrollmentPeriodQueryProvider
          props={{
            enrollmentPeriodId: enrollmentPeriodId,
          }}
        >
          {(enrollmentPeriod) => (
            <Text p={'sm'} c={'dark.7'} fz={'sm'} fw={600}>
              {formatEnrollmentToFullLabel(enrollmentPeriod)}
            </Text>
          )}
        </EnrollmentPeriodQueryProvider>

        <Table.ScrollContainer minWidth={rem(500)} type="native">
          <Table
            verticalSpacing={'sm'}
            highlightOnHover
            highlightOnHoverColor="gray.0"
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
                <RoleComponentManager
                  currentRole={authUser.role}
                  roleRender={{
                    admin: <Table.Th w={0}></Table.Th>,
                  }}
                />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transcripts.map((transcript) => (
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
                  <RoleComponentManager
                    currentRole={authUser.role}
                    roleRender={{
                      admin: (
                        <Table.Td>
                          <Menu
                            withArrow
                            position="bottom-end"
                            shadow="md"
                            width={200}
                          >
                            <Menu.Target>
                              <ActionIcon
                                onClick={(e) => e.stopPropagation()}
                                variant="subtle"
                                color="gray"
                                radius={'xl'}
                              >
                                <IconDotsVertical size={20} stroke={1.5} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEdit size={16} />}>
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                c="red"
                                leftSection={<IconTrash size={16} />}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      ),
                    }}
                  />
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Stack>
  )
}

function EnrollmentPeriodsSelector({
  onChange,
  transcripts,
}: {
  onChange: (value: string | null) => void
  transcripts: DetailedTranscriptDto[]
}) {
  const { search } = useSearchState(route)

  const enrollmentPeriodId =
    search.enrollmentPeriodId ??
    transcripts[0]?.courseOffering.enrollmentPeriod.id

  return (
    <AsyncSearchSelect
      variant="default"
      radius={'md'}
      label="Enrollment Period"
      placeholder="Select an enrollment period"
      withAsterisk
      preloadOptions
      initialValue={enrollmentPeriodId}
      getItemById={(id) =>
        enrollmentControllerFindOneEnrollmentOptions({
          path: { enrollmentId: id },
        })
      }
      getOptions={() => enrollmentControllerFindAllEnrollmentsOptions()}
      mapData={(data) =>
        data.enrollments.map((enrollment: EnrollmentPeriodDto) => ({
          value: enrollment.id,
          label: formatEnrollmentToFullLabel(enrollment),
        }))
      }
      mapItem={(enrollment) => ({
        value: enrollment.id,
        label: formatEnrollmentToFullLabel(enrollment),
      })}
      allowDeselect={false}
      onChange={onChange}
    />
  )
}

function StudentSelector({
  onChange,
  transcripts,
}: {
  onChange: (value: string | null) => void
  transcripts: DetailedTranscriptDto[]
}) {
  const { search } = useSearchState(route)

  const studentId = search.studentId ?? transcripts[0]?.user.id

  return (
    <AsyncSearchSelect
      variant="default"
      radius={'md'}
      label="Student"
      placeholder="Select a student"
      withAsterisk
      preloadOptions
      initialValue={studentId}
      getItemById={(id) =>
        usersControllerFindOneOptions({
          path: {
            id: id,
          },
        })
      }
      getOptions={(search) =>
        usersControllerFindAllOptions({
          query: {
            search,
            role: 'student',
          },
        })
      }
      mapData={(data) =>
        data.users.map((user: UserWithRelations) => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName}`,
          email: user.userAccount?.email ?? undefined,
        }))
      }
      mapItem={(user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        email: user.userAccount?.email ?? undefined,
      })}
      renderOption={({ option }) => (
        <Box>
          <Text fw={500} c={'dark.7'} fz={'sm'}>
            {option.label}
          </Text>
          <Text fw={400} c={'dark.4'} fz={'xs'}>
            {option.email}
          </Text>
        </Box>
      )}
      allowDeselect={false}
      onChange={onChange}
    />
  )
}

export default TranscriptPage
