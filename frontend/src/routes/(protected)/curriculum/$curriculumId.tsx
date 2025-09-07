import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import CurriculumView from '@/pages/admin/curriculum/curriculum.view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/curriculum/$curriculumId')({
  component: RouteComponent,
  pendingComponent: Loader,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CurriculumView />,
      }}
    />
  )
}
