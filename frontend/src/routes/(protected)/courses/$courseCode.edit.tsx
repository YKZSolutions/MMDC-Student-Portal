import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import CourseBuilder from '@/pages/admin/courses/$courseCode/edit/course-builder.tsx'

export const Route = createFileRoute('/(protected)/courses/$courseCode/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  if (!authUser) {
    return null //TODO: or a loader / skeleton
  }

  const { courseCode } = Route.useParams()
  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CourseBuilder courseCode={courseCode} />,
      }}
    />
  )
}
