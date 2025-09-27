import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { paginationSearchSchema } from '@/features/pagination/search-validation'
import CurriculumPrograms from '@/pages/admin/curriculum/curriculum.programs'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const programStateSearchSchema = paginationSearchSchema.extend({
  createProgram: z.boolean().optional(),
  updateProgram: z.uuid().optional(),
  selectedProgram: z.uuid().optional(),
  createMajor: z.boolean().optional(),
  updateMajor: z.uuid().optional(),
})

export const Route = createFileRoute('/(protected)/curriculum/programs/')({
  component: RouteComponent,
  pendingComponent: Loader,
  validateSearch: programStateSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CurriculumPrograms />,
      }}
    />
  )
}
