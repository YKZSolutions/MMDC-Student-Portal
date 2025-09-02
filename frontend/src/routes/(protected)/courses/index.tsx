import { createFileRoute } from '@tanstack/react-router'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type { Course, EnrolledAcademicTerm } from '@/features/courses/types'
import CourseDashboard from '@/pages/shared/courses/course-dashboard.tsx'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const enrolledTerms: EnrolledAcademicTerm[] = [
    {
      termId: 'termId1',
      schoolYear: 'SY 2024-2025',
      term: 'Term 1',
      isCurrent: false,
    } as EnrolledAcademicTerm,
    {
      termId: 'termId2',
      schoolYear: 'SY 2024-2025',
      term: 'Term 2',
      isCurrent: false,
    } as EnrolledAcademicTerm,
    {
      termId: 'termId3',
      schoolYear: 'SY 2024-2025',
      term: 'Term 3',
      isCurrent: false,
    } as EnrolledAcademicTerm,
    {
      termId: 'termId4',
      schoolYear: 'SY 2025-2026',
      term: 'Term 1',
      isCurrent: true,
    } as EnrolledAcademicTerm,
  ]

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <CourseDashboard academicTerms={enrolledTerms} />,
        admin: <CourseDashboard academicTerms={enrolledTerms} />, //TODO: change to all terms
        // mentor: <CoursesMentorPage />,
      }}
    />
  )
}
