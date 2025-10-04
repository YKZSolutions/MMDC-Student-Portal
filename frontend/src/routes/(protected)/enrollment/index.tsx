import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { isEnrollmentFinalized } from '@/features/enrollment/helpers'
import { paginationSearchSchema } from '@/features/pagination/search-validation'
import { courseEnrollmentControllerGetCourseEnrollmentsOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import EnrollmentAdminPage from '@/pages/admin/enrollment'
import EnrollmentStudentPage from '@/pages/student/enrollment'
import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

const enrollmentStateSearchSchema = paginationSearchSchema.extend({
  create: z.boolean().optional(),
  update: z.uuidv4().optional(),
  tab: z.string().optional(),
})

export const Route = createFileRoute('/(protected)/enrollment/')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    if (context.authUser.role === 'student') {
      const enrolledCourses = await context.queryClient.ensureQueryData(
        courseEnrollmentControllerGetCourseEnrollmentsOptions(),
      )

      const currentTab = new URLSearchParams(location.search ?? '').get('tab')

      // Only redirect if we need to change the tab (prevents redirect loop)
      if (
        isEnrollmentFinalized(enrolledCourses) &&
        currentTab !== 'finalization'
      ) {
        throw redirect({
          to: '/enrollment',
          search: { tab: 'finalization' },
        })
      }
    }
  },
  validateSearch: enrollmentStateSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <EnrollmentStudentPage />,
        admin: <EnrollmentAdminPage />,
      }}
    />
  )
}
