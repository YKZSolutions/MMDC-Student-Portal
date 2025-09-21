import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import CoursePublisher from '@/pages/admin/lms/$lmsCode/edit/course-publisher'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode_/publish',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      scheduled: search.scheduled === 'true',
      publish: search.publish === 'true',
      unpublish: search.unpublish === 'true',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const { courseCode } = useParams({ strict: false })
  const { scheduled, publish, unpublish } = Route.useSearch()

  if (!authUser || !courseCode) {
    //TODO: or a loader / skeleton
    return null
  }

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: (
          <CoursePublisher courseCode={courseCode} scheduled={scheduled} />
        ),
      }}
    />
  )
}
