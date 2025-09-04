import { createFileRoute, useParams } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import CoursePublisher from '@/pages/admin/courses/$courseCode/edit/course-publisher.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode_/publish',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { courseCode } = useParams({ strict: false })

  if (!authUser || !courseCode) {
    //TODO: or a loader / skeleton
    return null
  }

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CoursePublisher courseCode={courseCode} />,
      }}
    />
  )
}
