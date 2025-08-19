import { createFileRoute } from '@tanstack/react-router'
import EnrollmentStudentPage from '@/pages/student/enrollment'
import EnrollmentAdminPage from '@/pages/admin/enrollment'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import CoursesStudentPage from '@/pages/student/courses'
import CoursesAdminPage from '@/pages/admin/courses'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <CoursesStudentPage />,
        admin: <CoursesAdminPage />,
        // mentor: <CoursesMentorPage />,
      }}
    />
  )
}
