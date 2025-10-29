import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { paginationSearchSchema } from '@/features/pagination/search-validation'
import AdminCourseDashboardPage from '@/pages/admin/lms'
import LMSDashboardAdminPage from '@/pages/shared/lms/lms-dashboard-admin.page'
import LMSDashboardStudentPage from '@/pages/shared/lms/lms-dashboard-student.page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsDashboardStateSearchSchema = paginationSearchSchema.extend({
  vie: z.enum(['grid', 'list']).optional(),
})

export const Route = createFileRoute('/(protected)/lms/')({
  component: RouteComponent,
  validateSearch: lmsDashboardStateSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <LMSDashboardStudentPage />,
        admin: <LMSDashboardAdminPage />,
        // student: <StudentCourseDashboardPage />,
        // mentor: <MentorCourseDashboardPage />,
        // admin: <AdminCourseDashboardPage />,
      }}
    />
  )
}
