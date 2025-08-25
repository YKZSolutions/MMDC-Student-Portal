import type { IUsersQuery } from '@/features/user-management/types.ts'
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Group,
  rem,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { Suspense, useState } from 'react'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SearchComponent from '@/components/search-component.tsx'
import type {
  CourseGradebookForMentor,
  CourseGradebookForStudent,
  Grade,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import {useAuth} from "@/features/auth/auth.hook.ts";
import {IconNote} from "@tabler/icons-react";

export const mockStudentGradebook: CourseGradebookForStudent = {
    courseId: 'course_001',
    studentId: 'student_101',
    studentName: 'Alice Johnson',
    assignments: [
        // Scenario 1: Graded assignment with multiple attempts
        {
            assignmentId: 'assign_001',
            assignmentTitle: 'Introduction to React',
            points: 100,
            dueDate: '2023-10-15T23:59:59Z',
            submissions: [
                {
                    submissionStatus: 'draft',
                    submissionLink: 'https://example.com/submission/draft1',
                    submissionTimestamp: '2023-10-10T14:30:00Z',
                    attemptNumber: 1,
                    resubmissionAllowed: true,
                    isLate: false
                },
                {
                    submissionStatus: 'graded',
                    submissionLink: 'https://example.com/submission/final',
                    submissionTimestamp: '2023-10-15T22:45:00Z',
                    attemptNumber: 2,
                    resubmissionAllowed: false,
                    isLate: false,
                    grade: {
                        id: 'grade_001',
                        assignmentId: 'assign_001',
                        submissionId: 'sub_002',
                        studentId: 'student_101',
                        score: 95,
                        maxScore: 100,
                        feedback: 'Excellent work! Your component structure was well thought out.',
                        gradedBy: 'mentor_001',
                        gradedAt: '2023-10-17T10:30:00Z',
                        released: true
                    }
                }
            ],
            currentGrade: {
                score: 95,
                maxScore: 100,
                feedback: 'Excellent work! Your component structure was well thought out.',
                gradedAt: '2023-10-17T10:30:00Z'
            }
        },
        // Scenario 2: Ready for grading (submitted but not graded yet)
        {
            assignmentId: 'assign_002',
            assignmentTitle: 'Project Proposal',
            points: 50,
            dueDate: '2023-10-25T23:59:59Z',
            submissions: [
                {
                    submissionStatus: 'ready-for-grading',
                    submissionLink: 'https://example.com/proposal/submission',
                    submissionTimestamp: '2023-10-24T15:20:00Z',
                    attemptNumber: 1,
                    resubmissionAllowed: false,
                    isLate: false
                }
            ]
        },
        // Scenario 3: Pending (not submitted yet)
        {
            assignmentId: 'assign_003',
            assignmentTitle: 'Database Schema Design',
            points: 75,
            dueDate: '2023-11-05T23:59:59Z',
            submissions: [
                {
                    submissionStatus: 'pending',
                    attemptNumber: 0,
                    resubmissionAllowed: true,
                    isLate: false
                }
            ]
        },
        // Scenario 4: Late submission with penalty
        {
            assignmentId: 'assign_004',
            assignmentTitle: 'API Implementation',
            points: 100,
            dueDate: '2023-10-20T23:59:59Z',
            submissions: [
                {
                    submissionStatus: 'graded',
                    submissionLink: 'https://example.com/api/submission',
                    submissionTimestamp: '2023-10-22T09:15:00Z', // 2 days late
                    attemptNumber: 1,
                    resubmissionAllowed: false,
                    isLate: true,
                    lateDays: 2,
                    grade: {
                        id: 'grade_004',
                        assignmentId: 'assign_004',
                        submissionId: 'sub_004',
                        studentId: 'student_101',
                        score: 82, // Penalty applied
                        maxScore: 100,
                        feedback: 'Good implementation but late submission resulted in 10% penalty.',
                        gradedBy: 'mentor_001',
                        gradedAt: '2023-10-23T14:20:00Z',
                        released: true
                    }
                }
            ],
            currentGrade: {
                score: 82,
                maxScore: 100,
                feedback: 'Good implementation but late submission resulted in 10% penalty.',
                gradedAt: '2023-10-23T14:20:00Z'
            }
        },
        // Scenario 5: Group assignment
        {
            assignmentId: 'assign_005',
            assignmentTitle: 'Team Project',
            points: 200,
            dueDate: '2023-11-10T23:59:59Z',
            submissions: [
                {
                    submissionStatus: 'graded',
                    submissionLink: 'https://example.com/team-project',
                    submissionTimestamp: '2023-11-10T20:30:00Z',
                    attemptNumber: 1,
                    resubmissionAllowed: false,
                    isLate: false,
                    grade: {
                        id: 'grade_005',
                        assignmentId: 'assign_005',
                        submissionId: 'sub_005',
                        groupId: 'group_001',
                        groupMemberIds: ['student_101', 'student_102', 'student_103'],
                        score: 185,
                        maxScore: 200,
                        feedback: 'Excellent collaboration and project execution.',
                        gradedBy: 'mentor_001',
                        gradedAt: '2023-11-12T11:45:00Z',
                        released: true
                    }
                }
            ],
            currentGrade: {
                score: 185,
                maxScore: 200,
                feedback: 'Excellent collaboration and project execution.',
                gradedAt: '2023-11-12T11:45:00Z'
            }
        }
    ],
    totalScore: 362, // 95 + 82 + 185 (only graded assignments)
    totalMaxScore: 400, // 100 + 100 + 200 (only graded assignments)
    gpaEquivalent: 3.6
};

// --- Mock Data (Mentor) ---
export const mockMentorGradebook: CourseGradebookForMentor = {
    courseId: 'course_001',
    assignments: [
        {
            assignmentId: 'assign_001',
            assignmentTitle: 'Introduction to React',
            points: 100,
            dueDate: '2023-10-15T23:59:59Z',
            submissions: [
                {
                    studentId: 'student_101',
                    studentName: 'Alice Johnson',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-10-15T22:45:00Z',
                    grade: {
                        score: 95,
                        maxScore: 100,
                        feedback: 'Excellent work! Your component structure was well thought out.',
                        gradedAt: '2023-10-17T10:30:00Z'
                    }
                },
                {
                    studentId: 'student_102',
                    studentName: 'Bob Smith',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-10-15T21:30:00Z',
                    grade: {
                        score: 88,
                        maxScore: 100,
                        feedback: 'Good effort. Consider using more React hooks for state management.',
                        gradedAt: '2023-10-17T11:15:00Z'
                    }
                },
                {
                    studentId: 'student_103',
                    studentName: 'Charlie Brown',
                    submissionStatus: 'pending'
                },
                {
                    studentId: 'student_104',
                    studentName: 'Diana Prince',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-10-16T09:30:00Z', // Late submission
                    grade: {
                        score: 76,
                        maxScore: 100,
                        feedback: 'Good work but late submission with penalty applied.',
                        gradedAt: '2023-10-17T14:20:00Z'
                    }
                }
            ]
        },
        {
            assignmentId: 'assign_002',
            assignmentTitle: 'Project Proposal',
            points: 50,
            dueDate: '2023-10-25T23:59:59Z',
            submissions: [
                {
                    studentId: 'student_101',
                    studentName: 'Alice Johnson',
                    submissionStatus: 'ready-for-grading',
                    submissionTimestamp: '2023-10-24T15:20:00Z'
                },
                {
                    studentId: 'student_102',
                    studentName: 'Bob Smith',
                    submissionStatus: 'submitted',
                    submissionTimestamp: '2023-10-25T20:45:00Z'
                },
                {
                    studentId: 'student_104',
                    studentName: 'Diana Prince',
                    submissionStatus: 'draft',
                    submissionTimestamp: '2023-10-25T18:30:00Z'
                }
            ]
        },
        {
            assignmentId: 'assign_005',
            assignmentTitle: 'Team Project',
            points: 200,
            dueDate: '2023-11-10T23:59:59Z',
            submissions: [
                {
                    studentId: 'student_101',
                    studentName: 'Alice Johnson',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-11-10T20:30:00Z',
                    grade: {
                        score: 185,
                        maxScore: 200,
                        feedback: 'Excellent collaboration and project execution.',
                        gradedAt: '2023-11-12T11:45:00Z'
                    }
                },
                {
                    studentId: 'student_102',
                    studentName: 'Bob Smith',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-11-10T20:30:00Z',
                    grade: {
                        score: 185,
                        maxScore: 200,
                        feedback: 'Excellent collaboration and project execution.',
                        gradedAt: '2023-11-12T11:45:00Z'
                    }
                },
                {
                    studentId: 'student_103',
                    studentName: 'Charlie Brown',
                    submissionStatus: 'graded',
                    submissionTimestamp: '2023-11-10T20:30:00Z',
                    grade: {
                        score: 185,
                        maxScore: 200,
                        feedback: 'Excellent collaboration and project execution.',
                        gradedAt: '2023-11-12T11:45:00Z'
                    }
                }
            ]
        }
    ]
};

const CourseGrades = () => {
    const role = useAuth('protected').authUser.role
    const [studentFiltered, setStudentFiltered] = useState<StudentAssignmentGrade[]>([]

    )
    const [mentorFiltered, setMentorFiltered] = useState<CourseGradebookForMentor['assignments']>([]
    )

    return (
        <Stack gap="md" h={'100%'} w={'100%'}>
            <Group justify="space-between" align="start">
                <Title>Grades</Title>
            </Group>

            <Group justify="space-between" align="start">
                {role === 'student' ? (
                    <SearchComponent<StudentAssignmentGrade>
                        data={mockStudentGradebook.assignments}
                        onFilter={setStudentFiltered}
                        identifiers={['assignmentTitle']}
                        placeholder="Search..."
                    />
                ) : (
                    <SearchComponent<CourseGradebookForMentor['assignments'][number]>
                        data={mockMentorGradebook.assignments}
                        onFilter={setMentorFiltered}
                        identifiers={[
                            'assignmentTitle',
                            ['submissions', 'studentName'],
                        ]}
                        placeholder="Search..."
                    />
                )}

                <Group gap={rem(5)} justify="end" align="center">
                    <Button variant="default" radius="md">
                        Filters (to include)
                    </Button>
                </Group>
            </Group>

            {role === 'student' ? (
                <StudentGradesTable assignments={studentFiltered} />
            ) : (
                <MentorGradesTable assignments={mentorFiltered} />
            )}
        </Stack>
    )
}


// --- Student View Table ---
const StudentGradesTable = ({
  assignments,
}: {
  assignments: StudentAssignmentGrade[]
}) => (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table
            highlightOnHover
            highlightOnHoverColor="gray.0"
            style={{ borderRadius: rem('8px'), minWidth: '800px' }}
        >
            <Table.Thead>
                <Table.Tr bg={'gray.1'} c={'dark.5'}>
                    <Table.Th>Assignment</Table.Th>
                    <Table.Th>Due</Table.Th>
                    <Table.Th>Submitted At</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Feedback</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                <Suspense fallback={<SuspendedTableRows columns={6} />}>
                    {assignments.map((assignment) => {
                        // Get the latest submission
                        const latestSubmission =
                            assignment.submissions.length > 0
                                ? assignment.submissions[assignment.submissions.length - 1]
                                : null

                        // Determine if this is a group assignment
                        const isGroupAssignment =
                            latestSubmission?.grade?.groupId !== undefined

                        return (
                            <Table.Tr key={assignment.assignmentId}>
                                <Table.Td>
                                    <div>
                                        <Text fw={500}>{assignment.assignmentTitle}</Text>
                                        <Text size="sm" c="dimmed">
                                            {assignment.points} points
                                            {isGroupAssignment && ' (Group)'}
                                        </Text>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                                </Table.Td>
                                <Table.Td>
                                    {latestSubmission?.submissionTimestamp
                                        ? formatTimestampToDateTimeText(
                                            latestSubmission.submissionTimestamp,
                                        )
                                        : 'Not Submitted'}
                                    {latestSubmission?.isLate && (
                                        <Text size="xs" c="red">
                                            {latestSubmission.lateDays} day(s) late
                                        </Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={latestSubmission?.submissionStatus}
                                        variant="filled"
                                        size="sm"
                                    >
                                        {latestSubmission?.submissionStatus || 'pending'}
                                    </Badge>
                                    {assignment.submissions.length > 1 && (
                                        <Text size="xs" c="dimmed">
                                            {assignment.submissions.length} attempts
                                        </Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {assignment.currentGrade ? (
                                        <div>
                                            <Text fw={500}>
                                                {assignment.currentGrade.score} /{' '}
                                                {assignment.currentGrade.maxScore}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {assignment.currentGrade.gradedAt &&
                                                    `Graded ${formatTimestampToDateTimeText(assignment.currentGrade.gradedAt)}`}
                                            </Text>
                                        </div>
                                    ) : (
                                        <Text c="dimmed">- / {assignment.points}</Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {assignment.currentGrade?.feedback ? (
                                        <Tooltip label={assignment.currentGrade.feedback}>
                                            <IconNote size={20} color="blue" />
                                        </Tooltip>
                                    ) : (
                                        <IconNote size={20} color="gray" />
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </Suspense>
            </Table.Tbody>
        </Table>
    </Box>
)

// --- Mentor View Table ---
const MentorGradesTable = ({
  assignments,
}: {
  assignments: CourseGradebookForMentor['assignments']
}) => (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table
            highlightOnHover
            highlightOnHoverColor="gray.0"
            style={{ borderRadius: rem('8px'), minWidth: '1000px' }}
        >
            <Table.Thead>
                <Table.Tr bg={'gray.1'} c={'dark.5'}>
                    <Table.Th>Assignment</Table.Th>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Submitted At</Table.Th>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Feedback</Table.Th>
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                <Suspense fallback={<SuspendedTableRows columns={7} />}>
                    {assignments.flatMap((assignment) =>
                        assignment.submissions.map((submission) => (
                            <Table.Tr
                                key={`${assignment.assignmentId}-${submission.studentId}`}
                            >
                                <Table.Td>
                                    <div>
                                        <Text fw={500}>{assignment.assignmentTitle}</Text>
                                        <Text size="sm" c="dimmed">
                                            {assignment.points} points • Due{' '}
                                            {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
                                        </Text>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <Text>{submission.studentName}</Text>
                                    <Text size="xs" c="dimmed">
                                        ID: {submission.studentId}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={submission.submissionStatus}
                                        variant="filled"
                                        size="sm"
                                    >
                                        {submission.submissionStatus}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    {submission.submissionTimestamp
                                        ? formatTimestampToDateTimeText(
                                            submission.submissionTimestamp,
                                        )
                                        : 'Not Submitted'}
                                </Table.Td>
                                <Table.Td>
                                    {submission.grade ? (
                                        <div>
                                            <Text fw={500}>
                                                {submission.grade.score} / {submission.grade.maxScore}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {submission.grade.gradedAt &&
                                                    `Graded ${formatTimestampToDateTimeText(submission.grade.gradedAt)}`}
                                            </Text>
                                        </div>
                                    ) : (
                                        <Text c="dimmed">- / {assignment.points}</Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {submission.grade?.feedback ? (
                                        <Tooltip label={submission.grade.feedback}>
                                            <IconNote size={20} color="blue" />
                                        </Tooltip>
                                    ) : (
                                        <IconNote size={20} color="gray" />
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Button
                                        size="xs"
                                        variant="light"
                                        onClick={() => {
                                            // Handle grade/edit action
                                            console.log(
                                                'Grade assignment:',
                                                assignment.assignmentId,
                                                submission.studentId,
                                            )
                                        }}
                                    >
                                        {submission.submissionStatus === 'graded' ? 'Edit' : 'Grade'}
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        )),
                    )}
                </Suspense>
            </Table.Tbody>
        </Table>
    </Box>
)

// --- Suspended Table Rows (Skeleton) ---
const SuspendedTableRows = ({ columns = 6, rows = 5 }: { columns?: number; rows?: number }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <Table.Tr key={rowIdx}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Table.Td key={colIdx}>
                            <Skeleton height={20} radius="sm" />
                        </Table.Td>
                    ))}
                </Table.Tr>
            ))}
        </>
    )
}


export default CourseGrades
