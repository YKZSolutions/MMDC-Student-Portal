import type {
  CourseGradebookForMentor,
  StudentAssignmentGrade,
} from '@/features/courses/grades/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import React, { useState } from 'react'
import { Button, Group, rem, Stack, Tabs, Title } from '@mantine/core'
import SearchComponent from '@/components/search-component.tsx'
import {
  AdminGradesTable,
  MentorGradesTable,
  StudentGradesTable,
} from '@/features/courses/grades/grades-table.tsx'
import {
  mockMentorGradebook,
  mockStudentGradebook,
} from '@/features/courses/mocks.ts'

const CourseGrades = () => {
  const { authUser } = useAuth('protected')
  const [studentFiltered, setStudentFiltered] = useState<
    StudentAssignmentGrade[]
  >([])
  const [mentorFiltered, setMentorFiltered] = useState<
    CourseGradebookForMentor['assignments']
  >([])
  const [adminFiltered, setAdminFiltered] = useState<
    CourseGradebookForMentor['assignments']
  >([])
  const [viewMode, setViewMode] = useState<'by-assignment' | 'by-student'>(
    'by-assignment',
  )

  // Get role-specific data and filtering
  const getRoleSpecificContent = () => {
    switch (authUser.role) {
      case 'student':
        return {
          data: mockStudentGradebook.assignments,
          filtered: studentFiltered,
          onFilter: setStudentFiltered,
          identifiers: ['assignmentTitle'] as const,
        }
      case 'mentor':
        return {
          data: mockMentorGradebook.assignments,
          filtered: mentorFiltered,
          onFilter: setMentorFiltered,
          identifiers: [
            'assignmentTitle',
            ['submissions', 'studentName'],
          ] as const,
        }
      case 'admin':
        return {
          data: mockMentorGradebook.assignments, // Admins see same data as mentors but different view
          filtered: adminFiltered,
          onFilter: setAdminFiltered,
          identifiers: [
            'assignmentTitle',
            ['submissions', 'studentName'],
          ] as const,
        }
      default:
        throw new Error('Invalid role')
    }
  }

  const { data, filtered, onFilter, identifiers } = getRoleSpecificContent()

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title>Grades</Title>
        <Group align="start">
          <SearchComponent
            data={data as any}
            onFilter={onFilter as any}
            identifiers={identifiers as any}
            placeholder="Search..."
          />

          {/* View mode tabs for mentor/admin */}
          {(authUser.role === 'mentor' || authUser.role === 'admin') && (
            <Tabs
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
              variant="pills"
            >
              <Tabs.List>
                <Tabs.Tab value="by-assignment">By Assignment</Tabs.Tab>
                <Tabs.Tab value="by-student">By Student</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          )}

          <Group gap={rem(5)} justify="end" align="center">
            <Button variant="default" radius="md">
              Export
            </Button>
            <Button variant="default" radius="md">
              Filters
            </Button>
          </Group>
        </Group>
      </Group>

      {/* Role-specific table views */}
      {authUser.role === 'student' && (
        <StudentGradesTable assignments={studentFiltered} />
      )}

      {authUser.role === 'mentor' && (
        <MentorGradesTable assignments={mentorFiltered} viewMode={viewMode} />
      )}

      {authUser.role === 'admin' && (
        <AdminGradesTable assignments={adminFiltered} viewMode={viewMode} />
      )}
    </Stack>
  )
}

export default CourseGrades
