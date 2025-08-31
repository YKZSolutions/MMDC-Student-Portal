import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import CurriculumBuilder from '@/pages/admin/curriculum/curriculum.builder'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

const curriculumEditSearchSchema = z.object({
  openCourseList: z.boolean().optional(),
})

export type CurriculumEditSearch = z.infer<typeof curriculumEditSearchSchema>

export const Route = createFileRoute(
  '/(protected)/curriculum/$curriculumId_/edit',
)({
  component: RouteComponent,
  validateSearch: curriculumEditSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        admin: <CurriculumBuilder />,
      }}
    />
  )
}
