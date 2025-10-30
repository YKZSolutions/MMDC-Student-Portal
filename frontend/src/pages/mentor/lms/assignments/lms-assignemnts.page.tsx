import { formatTimestampToDateTimeText } from '@/utils/formatters'
import { toastMessage } from '@/utils/toast-message'
import {
  assignmentControllerFindAllForMentorOptions,
  submissionControllerFindOneOptions,
  submissionControllerFindOneQueryKey,
  submissionControllerGradeMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
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
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
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
} from '@tabler/icons-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import React, { Suspense, useEffect, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/assignments/')

const TABS = [
  { value: 'to-grade', label: 'To Grade', icon: <IconBook size={12} /> },
  { value: 'graded', label: 'Graded', icon: <IconCheck size={12} /> },
  { value: 'all', label: 'All Assignments', icon: <IconHistory size={12} /> },
]

interface SubmissionContent {
  type: 'link' | 'comment'
  content?: string
}

export default function MentorAssignmentsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].value)

  return (
    <Stack gap="md" p="md">
      <Title c="dark.7" order={2} fw={700}>
        Assignments
      </Title>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value!)}>
        <Tabs.List>
          {TABS.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={tab.icon}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Stack gap="md" py="md">
          <AssignmentsTable />
        </Stack>
      </Tabs>

      <Suspense fallback={null}>
        <SubmissionViewModal />
      </Suspense>
    </Stack>
  )
}

function AssignmentsTable() {
  const { lmsCode } = route.useParams()
  const navigate = route.useNavigate()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const { data: paginated } = useSuspenseQuery(
    assignmentControllerFindAllForMentorOptions({
      path: { moduleId: lmsCode },
    }),
  )

  const toggleExpand = (assignmentId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId)
      } else {
        newSet.add(assignmentId)
      }
      return newSet
    })
  }

  return (
    <Stack>
      <TextInput
        placeholder="Search assignments..."
        radius="md"
        leftSection={<IconSearch size={18} stroke={1} />}
      />

      <Table
        highlightOnHover
        style={{ borderRadius: rem(8), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
        verticalSpacing="lg"
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
              borderBottom: '1px solid',
              borderColor: 'var(--mantine-color-gray-3)',
            }}
            bg="gray.1"
            c="dark.5"
          >
            <Table.Th>Assignment</Table.Th>
            <Table.Th>Due Date</Table.Th>
            <Table.Th>Submissions</Table.Th>
            <Table.Th>Progress</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginated.assignments?.map((assignment) => {
            const isExpanded = expandedRows.has(assignment.id)

            return (
              <React.Fragment key={assignment.id}>
                <Table.Tr
                  onClick={() => toggleExpand(assignment.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="transparent"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(assignment.id)
                        }}
                      >
                        {isExpanded ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                      <Box>
                        <Text fw={500} c="dark.5">
                          {assignment.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {assignment.weightPercentage} points • Assignment
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" c="dark.3">
                      {dayjs(assignment.dueDate).format('MMM D [by] h:mm A')}
                    </Text>
                    <Badge
                      variant="outline"
                      size="xs"
                      color={
                        dayjs().isBefore(dayjs(assignment.dueDate))
                          ? 'green'
                          : 'red'
                      }
                    >
                      {dayjs().isBefore(dayjs(assignment.dueDate))
                        ? 'Open'
                        : 'Closed'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="light" size="sm">
                        {assignment.stats.submitted} submitted
                      </Badge>
                      <Badge color="green" variant="light" size="sm">
                        {assignment.stats.graded} graded
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} c="dark.5">
                      {assignment.stats.graded}/{assignment.stats.total}{' '}
                      completed
                    </Text>
                    <Progress
                      value={
                        assignment.stats.total > 0
                          ? (assignment.stats.graded / assignment.stats.total) *
                            100
                          : 0
                      }
                      color="blue"
                    />
                  </Table.Td>
                </Table.Tr>

                {/* Expanded submissions row */}
                <Table.Tr
                  style={{
                    border: isExpanded ? undefined : '0px',
                  }}
                >
                  <Table.Td colSpan={4} p={0}>
                    <Collapse in={isExpanded}>
                      <Stack gap="xs" p="md" bg="gray.0">
                        {assignment.submissions.length > 0 ? (
                          assignment.submissions.map((submission) => (
                            <Card
                              key={submission.id}
                              withBorder
                              p="sm"
                              radius="md"
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
                                          : 'blue'
                                      }
                                      variant="filled"
                                      size="xs"
                                    >
                                      {submission.grade !== undefined
                                        ? 'Graded'
                                        : 'Submitted'}
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
                                      ? `${submission.grade.finalScore}/${assignment.weightPercentage}`
                                      : 'Not graded'}
                                  </Text>
                                  <Button
                                    size="xs"
                                    variant="light"
                                    leftSection={<IconEye size={14} />}
                                    radius="md"
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
                                </Group>
                              </Group>
                            </Card>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed" ta="center" py="md">
                            No submissions yet
                          </Text>
                        )}
                      </Stack>
                    </Collapse>
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            )
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

function SubmissionViewModal() {
  const { view } = route.useSearch()
  const navigate = route.useNavigate()

  const { data: submission } = useQuery({
    ...submissionControllerFindOneOptions({
      path: { submissionId: view || '' },
    }),
    enabled: !!view,
  })

  const submissionContent =
    submission?.content as unknown as SubmissionContent[]

  const link = submissionContent?.find((item) => item.type === 'link')
  const comment = submissionContent?.find((item) => item.type === 'comment')

  return (
    <Modal
      styles={{
        content: {
          overflow: 'visible',
        },
      }}
      size="lg"
      opened={!!view}
      onClose={() =>
        navigate({ search: (prev) => ({ ...prev, view: undefined }) })
      }
      title={
        <Text fw={700} size="xl">
          Submission
        </Text>
      }
    >
      <Stack>
        <Stack>
          {link?.content && (
            <a href={link.content} target="_blank" rel="noopener noreferrer">
              <InputBase
                component="button"
                pointer
                label="Link"
                leftSection={<IconLink size={20} />}
              >
                <Text c="dark.3">{link.content}</Text>
              </InputBase>
            </a>
          )}

          {submission?.attachments && submission.attachments.length > 0 && (
            <Card withBorder p="sm">
              <Group>
                <Text>{submission.attachments[0].name}</Text>
              </Group>
            </Card>
          )}
        </Stack>
      </Stack>

      <Paper pos="absolute" top="calc(100% + 20px)" left={0} miw="100%">
        <Stack p="md">
          <Text fw={500}>Comments</Text>
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
          {comment?.content && (
            <Stack gap={0}>
              <Text fw={500} size="sm">
                Student Comment
              </Text>
              <Text>{comment.content}</Text>
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
    ...submissionControllerFindOneOptions({
      path: { submissionId: view || '' },
    }),
    enabled: !!view,
  })

  const [grade, setGrade] = useState(0)

  useEffect(() => {
    if (submission?.gradeRecord?.rawScore) {
      setGrade(new Decimal(submission.gradeRecord.rawScore).toNumber())
    } else {
      setGrade(0)
    }
  }, [submission])

  const { mutateAsync: gradeSubmission, isPending } = useAppMutation(
    submissionControllerGradeMutation,
    toastMessage('submission', 'grading', 'graded'),
    {
      onSuccess: () => {
        const { queryClient } = getContext()
        queryClient.invalidateQueries({
          queryKey: submissionControllerFindOneQueryKey({
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

  const isGradeUnchanged =
    submission?.gradeRecord?.rawScore !== undefined &&
    grade === new Decimal(submission.gradeRecord.rawScore).toNumber()

  return (
    <Paper pos="absolute" top={0} left="calc(100% + 10px)" miw={300}>
      <Stack p="md">
        <Card withBorder py="sm" px="sm">
          <Group>
            <Avatar size="sm" />
            <Stack gap={0}>
              <Text fw={500}>
                {submission
                  ? `${submission.student.firstName} ${submission.student.lastName}`
                  : 'Loading...'}
              </Text>
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
              max={Number(submission?.assignment?.weightPercentage) || 100}
              min={0}
              value={grade}
              onChange={(val) => setGrade(Number(val))}
              disabled={isPending}
            />
            <Text>/</Text>
            <TextInput
              flex={4}
              readOnly
              value={submission?.assignment?.weightPercentage || 'N/A'}
            />
            <Text>points</Text>
          </Group>
        </Stack>

        <Group justify="flex-end">
          <Button
            disabled={isGradeUnchanged || !submission}
            loading={isPending}
            onClick={handleGradeSubmission}
          >
            {submission?.gradeRecord ? 'Update Grade' : 'Grade'}
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
