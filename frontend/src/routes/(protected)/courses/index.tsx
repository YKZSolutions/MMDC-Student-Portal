import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  mockAcademicPrograms,
  mockCourseData,
  mockEnrolledCourse,
  mockTerms,
} from '@/features/courses/mocks.ts'
import AdminCourseDashboardPage from '@/pages/admin/courses'
import MentorCourseDashboardPage from '@/pages/mentor/courses'
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
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <StudentCourseDashboardPage />,
        mentor: (
          //TODO: might need to separate this later
          // since mentors should only see courses they've been assigned
          // <MentorAdminDashboardPage
          //   academicTerms={academicTerms}
          //   academicPrograms={academicPrograms}
          //   coursesData={coursesData as Course[]}
          // />
          <MentorCourseDashboardPage />
        ),
        admin: <AdminCourseDashboardPage />,
      }}
    />
  )
}
