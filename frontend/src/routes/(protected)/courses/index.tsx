import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  mockAcademicPrograms,
  mockCourseData,
  mockEnrolledCourse,
  mockTerms,
} from '@/features/courses/mocks.ts'
import type { Course, EnrolledCourse } from '@/features/courses/types.ts'
import MentorAdminDashboardPage from '@/pages/admin/courses'
import StudentCourseDashboardPage from '@/pages/student/courses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
  loader: ({ context }) => {
    return {
      terms: mockTerms,
      academicPrograms: mockAcademicPrograms,
      courses:
        context.authUser?.role === 'student'
          ? mockEnrolledCourse
          : mockCourseData,
    } //TODO: replace this with actual fetch
  },
})

function RouteComponent() {
  const { authUser } = useAuth('protected') //TODO: use this later for fetching enrolled terms
  const academicTerms = Route.useLoaderData().terms //TODO: replace with suspense query
  const academicPrograms = Route.useLoaderData().academicPrograms
  const coursesData = Route.useLoaderData().courses

  if (!authUser) {
  }

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: (
          <StudentCourseDashboardPage
            coursesData={coursesData as EnrolledCourse[]}
          />
        ),
        mentor: (
          //TODO: might need to separate this later
          // since mentors should only see courses they've been assigned
          <MentorAdminDashboardPage
            academicTerms={academicTerms}
            academicPrograms={academicPrograms}
            coursesData={coursesData as Course[]}
          />
        ),
        admin: (
          <MentorAdminDashboardPage
            academicTerms={academicTerms}
            academicPrograms={academicPrograms}
            coursesData={coursesData as Course[]}
          />
        ),
      }}
    />
  )
}
