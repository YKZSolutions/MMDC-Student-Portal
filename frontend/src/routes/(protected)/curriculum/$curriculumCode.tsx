import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { curriculumControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import CurriculumView from '@/pages/admin/curriculum/curriculum.view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/curriculum/$curriculumCode')(
  {
    component: RouteComponent,
    pendingComponent: Loader,
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        curriculumControllerFindOneOptions({
          path: { id: params.curriculumCode },
        }),
      ),
  },
)

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
