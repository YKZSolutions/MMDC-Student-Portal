import SubmitButton from '@/components/submit-button.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import {
  mockAssignmentSubmissionReports,
  mockStudentAssignments,
} from '@/features/courses/mocks.ts'
import {
  lmsAssignmentControllerFindAllForAdmin,
  type Role,
} from '@/integrations/api/client'
import {
  lmsAssignmentControllerFindAllForAdminOptions,
  lmsAssignmentControllerFindAllForMentorOptions,
  lmsAssignmentControllerFindAllForStudentOptions,
  lmsAssignmentControllerFindOneOptions,
  lmsSubmissionControllerFindOneOptions,
  lmsSubmissionControllerFindOneQueryKey,
  lmsSubmissionControllerGradeMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import { toastMessage } from '@/utils/toast-message'
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Group,
  InputBase,
  Modal,
  NumberInput,
  Paper,
  Progress,
  rem,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core'
import {
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconEye,
  IconHistory,
  IconLink,
  IconSearch,
  IconSend,
} from '@tabler/icons-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import React, { type ReactNode, Suspense, useEffect, useState } from 'react'

type RoleBasedAssignmentConfig = {
  [K in Role]: {
    tabs: {
      value: string
      label: string
      icon: ReactNode
    }[]
  }
}

const roleConfig: RoleBasedAssignmentConfig = {
  student: {
    tabs: [
      {
        value: 'all',
        label: 'All',
        icon: <IconHistory size={12} />,
      },
      { value: 'todo', label: 'Todo', icon: <IconSend size={12} /> },
      {
        value: 'completed',
        label: 'Completed',
        icon: <IconHistory size={12} />,
      },
    ],
  },
  admin: {
    tabs: [
      { value: 'all', label: 'All Assignments', icon: <IconBook size={12} /> },
      {
        value: 'needs-attention',
        label: 'Needs Attention',
        icon: <IconCheck size={12} />,
      },
    ],
  },
  mentor: {
    tabs: [
      { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
      { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
      {
        value: 'all',
        label: 'All Assignments',
        icon: <IconHistory size={12} />,
      },
    ],
  },
}

const route = getRouteApi('/(protected)/lms/$lmsCode/assignments/')

function AssignmentPage() {
  const { authUser } = useAuth('protected')
  const [activeTab, setActiveTab] = useState(
    roleConfig[authUser.role].tabs[0].value,
  )

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Title c="dark.7" variant="hero" order={2} fw={700}>
        Assignments
      </Title>

      <Stack>
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as any)}
        >
          <Tabs.List>
            {roleConfig[authUser.role].tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={tab.icon}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Stack gap="md" py={'md'}>
            {/* Role-specific Panels */}
            <AssignmentPanelsFactory activeTab={activeTab} />
          </Stack>
        </Tabs>
      </Stack>
    </Stack>
  )
}

function AssignmentPanelsFactory({ activeTab }: { activeTab: string }) {
  const { authUser } = useAuth('protected')

  switch (authUser.role) {
    case 'student':
      return <StudentAssignments />
    case 'mentor':
      return <MentorAssignments />
    case 'admin':
      return <AdminAssignments />
    default:
      return null
  }
}

// Student view - keep card layout (friendly, task-oriented)
function StudentAssignments() {
  const { lmsCode } = route.useParams()

  const { data: paginated } = useSuspenseQuery(
    lmsAssignmentControllerFindAllForStudentOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const { assignments, meta } = paginated

  console.log(assignments)

  return (
    <Stack>
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />

      {assignments?.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          title={assignment.title}
          status={
            assignment.submissions.length > 0
              ? assignment.submissions[0].grade !== undefined
                ? 'graded'
                : 'submitted'
              : 'pending'
          }
          type={'assignment'}
          points={Number(assignment.grading?.weight) || 0}
          submittedAt={
            assignment.submissions.length > 0
              ? assignment.submissions[0].submittedAt
              : null
          }
          dueAt={assignment.dueDate}
        />
      ))}
    </Stack>
  )
}

// Mentor view - table-first for grading queue
function MentorAssignments() {
  const { lmsCode } = route.useParams()
  const navigate = route.useNavigate()

  const { data: paginated } = useSuspenseQuery(
    lmsAssignmentControllerFindAllForMentorOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const { assignments, meta } = paginated

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (assignmentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId)
    } else {
      newExpanded.add(assignmentId)
    }
    setExpandedRows(newExpanded)
  }

  const getSubmissionCounts = (report: AssignmentSubmissionReport) => {
    const submitted = report.submissions.filter(
      (s) => s.submissionStatus === 'submitted',
    ).length
    const graded = report.submissions.filter(
      (s) => s.submissionStatus === 'graded',
    ).length
    const pending = report.submissions.filter(
      (s) => s.submissionStatus === 'pending',
    ).length

    return { submitted, graded, pending, total: report.submissions.length }
  }

  return (
    <Stack>
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />

      <Table
        highlightOnHover
        style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
        verticalSpacing={'lg'}
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
              borderBottom: '1px solid',
              borderColor: 'var(--mantine-color-gray-3)',
            }}
            bg={'gray.1'}
            c={'dark.5'}
          >
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Submissions</Table.Th>
            <Table.Th>Progress</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {assignments?.map((report) => {
            const isExpanded = expandedRows.has(report.id)

            return (
              <React.Fragment key={report.id}>
                <Table.Tr
                  onClick={() => toggleExpand(report.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="transparent"
                        size="sm"
                        onClick={() => toggleExpand(report.id)}
                      >
                        {isExpanded ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                      <Box>
                        <Text fw={500} c="dark.5">
                          {report.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {report.grading?.weight} points • {'assignment'}
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" c={'dark.3'}>
                      {dayjs(report.dueDate).format('MMM D [by] H:mm A')}
                    </Text>
                    <Badge
                      variant="outline"
                      size="xs"
                      color={
                        dayjs().isBefore(dayjs(report.dueDate))
                          ? 'green'
                          : 'red'
                      }
                    >
                      {dayjs().isBefore(dayjs(report.dueDate))
                        ? 'open'
                        : 'closed'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="light" size="sm">
                        {report.stats.submitted} submitted
                      </Badge>
                      <Badge color="green" variant="light" size="sm">
                        {report.stats.graded} graded
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} c={'dark.5'}>
                      {report.stats.graded}/{report.stats.total} completed
                    </Text>
                    <Progress
                      value={(report.stats.graded / report.stats.total) * 100}
                      color={'blue'}
                    />
                  </Table.Td>
                </Table.Tr>

                {/* Expanded submissions row */}
                <Table.Tr
                  style={{
                    border: isExpanded ? undefined : '0px',
                  }}
                >
                  <Table.Td colSpan={5} p={0}>
                    <Collapse in={isExpanded}>
                      <Stack gap="xs" p="md" bg="gray.0">
                        {report.submissions.map((submission) => (
                          <Card
                            key={submission.id}
                            withBorder
                            p="sm"
                            radius={'md'}
                          >
                            <Group justify="space-between">
                              <Stack gap={2}>
                                <Text fw={500} size="sm">
                                  {`${submission.student.firstName} ${submission.student.lastName}`}
                                </Text>
                                <Group gap="xs">
                                  <Badge
                                    color={
                                      submission.grade !== undefined
                                        ? 'green'
                                        : 'primary'
                                    }
                                    variant="filled"
                                    size="xs"
                                  >
                                    {submission.grade !== undefined
                                      ? 'graded'
                                      : 'submitted'}
                                  </Badge>
                                  {submission.submittedAt && (
                                    <Text size="sm" c="dimmed">
                                      {formatTimestampToDateTimeText(
                                        submission.submittedAt,
                                      )}
                                    </Text>
                                  )}
                                </Group>
                              </Stack>
                              <Group gap={rem(10)}>
                                <Text size="xs" fw={500}>
                                  {submission.grade
                                    ? `${submission.grade.finalScore}/${report.grading?.weight}`
                                    : 'Not graded'}
                                </Text>
                                <Button
                                  size="xs"
                                  variant="light"
                                  leftSection={<IconEye size={14} />}
                                  radius={'md'}
                                  onClick={() =>
                                    navigate({
                                      search: (prev) => ({
                                        ...prev,
                                        view: submission.id,
                                      }),
                                    })
                                  }
                                >
                                  View
                                </Button>
                                {/* <SubmitButton
                                  submissionStatus={submission.submissionStatus}
                                  onClick={() => {}}
                                  dueDate={report.dueDate}
                                  assignmentStatus={report.status}
                                /> */}
                              </Group>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </Collapse>
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            )
          })}
        </Table.Tbody>
      </Table>

      {/* Submission Detail Modal */}
      {/* <Modal
        opened={!!submissionModalData}
        onClose={() => setSubmissionModalData(null)}
        title="Submission Details"
        size="lg"
      >
        {submissionModalData && (
          <Stack>
            <Group justify="space-between">
              <Title order={4}>{submissionModalData.assignment.title}</Title>
              <Badge>{submissionModalData.assignment.type}</Badge>
            </Group>
            <Text>
              Student:{' '}
              {'studentName' in submissionModalData.submission
                ? submissionModalData.submission.studentName
                : `Group ${submissionModalData.submission.groupId}`}
            </Text>
          </Stack>
        )}
      </Modal> */}
      <Suspense>
        <SubmissionViewModal />
      </Suspense>
    </Stack>
  )
}

interface SubmissionContent {
  type: 'link' | 'comment'
  content?: string
}

function SubmissionViewModal() {
  const { view } = route.useSearch()
  const navigate = route.useNavigate()

  const { data: submission } = useQuery({
    ...lmsSubmissionControllerFindOneOptions({
      path: { submissionId: view || '' },
    }),
    enabled: view !== undefined,
  })

  const submissionContent =
    submission?.content as unknown as SubmissionContent[]

  const attachments = submission?.attachments

  const link = submissionContent?.find(
    (submission) => submission.type === 'link',
  )
  const comment = submissionContent?.find(
    (submission) => submission.type === 'comment',
  )

  return (
    <Modal
      // lockScroll={false}
      styles={{
        content: {
          overflow: 'visible',
        },
      }}
      size="lg"
      opened={view !== undefined}
      onClose={() =>
        navigate({ search: (prev) => ({ ...prev, view: undefined }) })
      }
      title={
        <>
          <Text fw={700} size="xl">
            Submission
          </Text>
        </>
      }
    >
      <Stack
      // mih={200}
      >
        <Stack>
          <a href={link?.content} target="_blank">
            <InputBase
              component="button"
              pointer
              label="Link"
              leftSection={<IconLink size={20} />}
            >
              <Text c="dark.3">{link?.content}</Text>
            </InputBase>
          </a>

          {attachments && attachments.length > 0 && (
            <Card>
              <Group>
                <Text>{attachments[0].name}</Text>
              </Group>
            </Card>
          )}
        </Stack>
      </Stack>

      <Paper pos="absolute" top={'calc(100% + 20px)'} left={0} miw={'100%'}>
        <Stack p="md">
          <Text fw={500}> Comments</Text>
          <Textarea
            placeholder="Add a comment..."
            minRows={2}
            autosize
            leftSection={
              <Group align="start" h="100%" pt={6}>
                <Avatar size="sm" />
              </Group>
            }
          />
          {comment && (
            <Stack gap={0}>
              <Text fw={500} size="sm">
                Comments
              </Text>
              <Text>{comment?.content}</Text>
            </Stack>
          )}
        </Stack>
      </Paper>

      <SubmissionGradeForm />
    </Modal>
  )
}

function SubmissionGradeForm() {
  const { view } = route.useSearch()

  const { data: submission } = useQuery({
    ...lmsSubmissionControllerFindOneOptions({
      path: { submissionId: view || '' },
    }),
    enabled: view !== undefined,
  })

  const [grade, setGrade] = useState(
    new Decimal(submission?.grade?.rawScore || 0).toNumber(),
  )

  useEffect(() => {
    setGrade(new Decimal(submission?.grade?.rawScore || 0).toNumber())
  }, [submission])

  const { mutateAsync: gradeSubmission, isPending } = useAppMutation(
    lmsSubmissionControllerGradeMutation,
    toastMessage('submission', 'grading', 'graded'),
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: lmsSubmissionControllerFindOneQueryKey({
            path: { submissionId: view || '' },
          }),
        })
      },
    },
  )

  const handleGradeSubmission = () => {
    if (!submission) return

    gradeSubmission({
      path: { submissionId: submission.id },
      body: {
        studentId: submission.student.id,
        grade,
      },
    })
  }

  return (
    <Paper pos="absolute" top={0} left={'calc(100% + 10px)'} miw={300}>
      <Stack p="md">
        {/* <Select
            label="Assignment"
            defaultValue={submission?.assignment.title}
          />
          <Select label="Student" /> */}
        <Card withBorder py="sm" px="sm">
          <Group>
            <Avatar size="sm" />
            <Stack gap={0}>
              <Text
                fw={500}
              >{`${submission?.student.firstName} ${submission?.student.lastName}`}</Text>
            </Stack>
          </Group>
        </Card>

        <Stack gap={4}>
          <Text fw={500} size="sm">
            Grade
          </Text>
          <Group gap="xs">
            <NumberInput
              flex={5}
              placeholder="0"
              max={Number(submission?.grading?.weight) || 0}
              min={0}
              value={grade}
              onChange={(val) => setGrade(Number(val))}
              disabled={isPending}
            />
            <Text>/</Text>
            <TextInput
              flex={4}
              readOnly
              defaultValue={submission?.grading?.weight || 'N/A'}
            />
            <Text>points</Text>
          </Group>
        </Stack>

        <Group justify="end">
          <Button
            disabled={
              submission?.grade?.rawScore
                ? grade === new Decimal(submission.grade.rawScore).toNumber()
                : false
            }
            loading={isPending}
            onClick={() => handleGradeSubmission()}
          >
            Grade
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}

// Admin view - summary/oversight focused
function AdminAssignments() {
  const { lmsCode } = route.useParams()

  const { data: paginated } = useSuspenseQuery(
    lmsAssignmentControllerFindAllForAdminOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const { assignments, meta } = paginated

  return (
    <Stack>
      <TextInput
        placeholder="Search assignments"
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />
      <Table.ScrollContainer minWidth={rem(800)}>
        <Table
          highlightOnHover
          style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
          styles={{
            th: {
              fontWeight: 500,
            },
          }}
          verticalSpacing={'lg'}
        >
          <Table.Thead>
            <Table.Tr
              style={{
                border: '0px',
                borderBottom: '1px solid',
                borderColor: 'var(--mantine-color-gray-3)',
              }}
              bg={'gray.1'}
              c={'dark.5'}
            >
              <Table.Th>Assignment</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Completion Rate</Table.Th>
              <Table.Th>Configuration</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments?.map((report) => {
              // const stats = getAssignmentStats(report)

              return (
                <Table.Tr key={report.id}>
                  <Table.Td>
                    <Box>
                      <Text fw={500} c={'dark.5'}>
                        {report.title}
                      </Text>
                      {report.grading && (
                        <Text size="xs" c="dimmed">
                          {report.grading.weight} points
                        </Text>
                      )}
                    </Box>
                  </Table.Td>
                  <Table.Td>
                    {report.dueDate ? (
                      <Stack gap={0}>
                        <Text fw={500} size="sm" c={'dark.3'}>
                          {/* {formatTimestampToDateTimeText(report.dueDate, 'by')} */}
                          {dayjs(report.dueDate).format('MMM D YYYY')}
                        </Text>
                        <Text fw={500} size="xs" c={'dark.1'}>
                          {dayjs(report.dueDate).format('HH:mm A')}
                        </Text>
                      </Stack>
                    ) : (
                      <Text fw={500} size="sm" c={'dark.3'}>
                        N/A
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="outline"
                      size="sm"
                      color={
                        dayjs().isBefore(dayjs(report.dueDate))
                          ? 'green'
                          : 'red'
                      }
                    >
                      {dayjs().isBefore(dayjs(report.dueDate))
                        ? 'open'
                        : 'closed'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {/* <Text fw={500} c="dark.5">
                      {stats.completionRate || 0}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      {stats.graded}/{stats.total} completed
                    </Text>
                    <Progress
                      value={(stats.graded / stats.total) * 100}
                      color={'blue'}
                    /> */}
                    <Text fw={500} c="dark.5">
                      {report.stats.total > 0
                        ? ((report.stats.submitted / report.stats.total) * 100).toFixed(0)
                        : 0
                      }%
                    </Text>
                    <Text size="xs" c="dimmed">
                      {report.stats.submitted}/{report.stats.total} completed
                    </Text>
                    <Progress
                      value={
                        report.stats.total > 0
                          ? (report.stats.submitted / report.stats.total) * 100
                          : 0
                      }
                      color={'blue'}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="dot" size="xs">
                        {report.mode === 'GROUP' ? 'Group' : 'Individual'}
                      </Badge>
                      {report.maxAttempts && report.maxAttempts > 0 && (
                        <Badge color="orange" variant="dot" size="xs">
                          Resubmission
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  )
}

interface AssignmentCardProps {
  title: string
  status: string
  type: string
  points: number
  submittedAt: string | null
  dueAt: string | null
}

function AssignmentCard(props: AssignmentCardProps) {
  return (
    <Card withBorder radius="md" p={'lg'}>
      <Group justify="space-between" align="center">
        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
          <Avatar radius="md" color="blue">
            <IconBook size={18} />
          </Avatar>

          <Stack gap={rem(5)}>
            <Group align="center">
              <Title order={5} fw={600}>
                {props.title}
              </Title>
              <Badge color={props.status} variant="outline" size="sm">
                {props.status}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2} tt={'capitalize'}>
              {props.type} • {props.points} points
            </Text>

            <Group gap="sm">
              {props.submittedAt ? (
                <Text size="sm" fw={600} c="dimmed">
                  Submitted:{' '}
                  {dayjs(props.submittedAt).format('MMM D [by] H:mm A')}
                </Text>
              ) : (
                <Text size="sm" fw={600} c="dimmed">
                  Due: {dayjs(props.dueAt).format('MMM D [by] H:mm A')}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>

        {/* <SubmitButton
          submissionStatus={props.status}
          onClick={() => {}}
          dueDate={props.dueAt}
          assignmentStatus={props.status}
        /> */}
      </Group>
    </Card>
  )
}

export default AssignmentPage
