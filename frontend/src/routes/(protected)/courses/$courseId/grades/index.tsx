import { createFileRoute } from '@tanstack/react-router'
import GradesPageStudentView from '@/pages/student/courses/$courseId/grades'
import CourseOverviewStudentView from '@/pages/student/courses/$courseId'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'

export const Route = createFileRoute('/(protected)/courses/$courseId/grades/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return <RoleComponentManager
    currentRole={authUser.role}
    roleRender={{
      student: <GradesPageStudentView />,
    }}
  />
}
