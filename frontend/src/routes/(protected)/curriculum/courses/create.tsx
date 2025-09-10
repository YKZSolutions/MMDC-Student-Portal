import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import AddCurriculumCourse from '@/pages/admin/curriculum/curriculum.add-course'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/curriculum/courses/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <AddCurriculumCourse />,
      }}
    />
  )
}
