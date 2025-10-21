import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { isEnrollmentFinalized } from '@/features/enrollment/helpers'
import { zEnrollmentStatusEnum } from '@/features/enrollment/validation'
import { courseEnrollmentControllerGetCourseEnrollmentsOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { mergeCommonSearchSchema } from '@/integrations/zod/merge-common-schema'
import EnrollmentAdminPage from '@/pages/admin/enrollment'
import EnrollmentStudentPage from '@/pages/student/enrollment'
import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

const enrollmentSearchSchema = mergeCommonSearchSchema({
  create: z.boolean().optional(),
  update: z.uuidv4().optional(),
  tab: z.string().optional(),
  status: z.enum(zEnrollmentStatusEnum.options).optional(),
})

export type EnrollmentSearchSchema = z.infer<
  typeof enrollmentSearchSchema
>

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
  validateSearch: enrollmentSearchSchema,
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
