import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import CurriculumUpdate from '@/pages/admin/curriculum/curriculum.update'
import { Loader } from '@/components/loader-component'
import { curriculumControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'

const curriculumEditSearchSchema = z.object({
  openCourseList: z.boolean().optional(),
})

export type CurriculumEditSearch = z.infer<typeof curriculumEditSearchSchema>

export const Route = createFileRoute(
  '/(protected)/curriculum/$curriculumCode_/edit',
)({
  component: RouteComponent,
  validateSearch: curriculumEditSearchSchema,
  pendingComponent: Loader,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      curriculumControllerFindOneOptions({
        path: { id: params.curriculumCode },
      }),
    ),
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CurriculumUpdate />,
      }}
    />
  )
}
