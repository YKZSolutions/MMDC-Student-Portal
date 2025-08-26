import type {
  CourseGradebookForMentor,
  CourseGradebookForStudent,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { useState } from 'react'
import { Button, Group, rem } from '@mantine/core'
import SearchComponent from '@/components/search-component.tsx'
import {
  MentorGradesTable,
  StudentGradesTable,
} from '@/features/courses/grades/course-grades-table.tsx'
import CourseMainLayout from '@/features/courses/course-main-layout.tsx'

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
          isLate: false,
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
            feedback:
              'Excellent work! Your component structure was well thought out.',
            gradedBy: 'mentor_001',
            gradedAt: '2023-10-17T10:30:00Z',
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 95,
        maxScore: 100,
        feedback:
          'Excellent work! Your component structure was well thought out.',
        gradedAt: '2023-10-17T10:30:00Z',
      },
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
          isLate: false,
        },
      ],
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
          isLate: false,
        },
      ],
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
            feedback:
              'Good implementation but late submission resulted in 10% penalty.',
            gradedBy: 'mentor_001',
            gradedAt: '2023-10-23T14:20:00Z',
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 82,
        maxScore: 100,
        feedback:
          'Good implementation but late submission resulted in 10% penalty.',
        gradedAt: '2023-10-23T14:20:00Z',
      },
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
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 185,
        maxScore: 200,
        feedback: 'Excellent collaboration and project execution.',
        gradedAt: '2023-11-12T11:45:00Z',
      },
    },
  ],
  totalScore: 362, // 95 + 82 + 185 (only graded assignments)
  totalMaxScore: 400, // 100 + 100 + 200 (only graded assignments)
  gpaEquivalent: 3.6,
}

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
            feedback:
              'Excellent work! Your component structure was well thought out.',
            gradedAt: '2023-10-17T10:30:00Z',
          },
        },
        {
          studentId: 'student_102',
          studentName: 'Bob Smith',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-10-15T21:30:00Z',
          grade: {
            score: 88,
            maxScore: 100,
            feedback:
              'Good effort. Consider using more React hooks for state management.',
            gradedAt: '2023-10-17T11:15:00Z',
          },
        },
        {
          studentId: 'student_103',
          studentName: 'Charlie Brown',
          submissionStatus: 'pending',
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
            gradedAt: '2023-10-17T14:20:00Z',
          },
        },
      ],
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
          submissionTimestamp: '2023-10-24T15:20:00Z',
        },
        {
          studentId: 'student_102',
          studentName: 'Bob Smith',
          submissionStatus: 'submitted',
          submissionTimestamp: '2023-10-25T20:45:00Z',
        },
        {
          studentId: 'student_104',
          studentName: 'Diana Prince',
          submissionStatus: 'draft',
          submissionTimestamp: '2023-10-25T18:30:00Z',
        },
      ],
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
            gradedAt: '2023-11-12T11:45:00Z',
          },
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
            gradedAt: '2023-11-12T11:45:00Z',
          },
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
            gradedAt: '2023-11-12T11:45:00Z',
          },
        },
      ],
    },
  ],
}

const CourseGrades = () => {
  const role = useAuth('protected').authUser.role
  const [studentFiltered, setStudentFiltered] = useState<
    StudentAssignmentGrade[]
  >([])
  const [mentorFiltered, setMentorFiltered] = useState<
    CourseGradebookForMentor['assignments']
  >([])

  return (
    <CourseMainLayout
      title={'Grades'}
      headerRightSection={
        <Group align="start">
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
              identifiers={['assignmentTitle', ['submissions', 'studentName']]}
              placeholder="Search..."
            />
          )}

          <Group gap={rem(5)} justify="end" align="center">
            <Button variant="default" radius="md">
              Filters (to include)
            </Button>
          </Group>
        </Group>
      }
    >
      {role === 'student' ? (
        <StudentGradesTable assignments={studentFiltered} />
      ) : (
        <MentorGradesTable assignments={mentorFiltered} />
      )}
    </CourseMainLayout>
  )
}

export default CourseGrades
