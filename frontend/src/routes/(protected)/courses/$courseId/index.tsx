import { createFileRoute } from '@tanstack/react-router'
import CourseOverviewStudentView from '@/pages/student/courses/$courseId'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'

export const Route = createFileRoute(
  '/(protected)/courses/$courseId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <CourseOverviewStudentView />,
      }}
    />
  )
}
