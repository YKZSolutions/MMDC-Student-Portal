import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { paginationSearchSchema } from '@/features/pagination/search-validation'
import CurriculumCourses from '@/pages/admin/curriculum/curriculum.courses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/curriculum/courses/')({
  component: RouteComponent,
  validateSearch: paginationSearchSchema,
  pendingComponent: Loader,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CurriculumCourses />,
      }}
    />
  )
}
