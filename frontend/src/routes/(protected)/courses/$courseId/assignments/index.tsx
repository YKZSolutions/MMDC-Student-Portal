import { createFileRoute } from '@tanstack/react-router'
import AssignmentsPageStudentView from '@/pages/student/courses/$courseId/assignments'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import GradesPageStudentView from '@/pages/student/courses/$courseId/grades'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return <RoleComponentManager
    currentRole={authUser.role}
    roleRender={{
      student: <AssignmentsPageStudentView />,
    }}
  />
}
