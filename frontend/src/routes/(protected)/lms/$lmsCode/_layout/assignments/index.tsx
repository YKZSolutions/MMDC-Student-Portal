import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import LMSAssignmentsPage from '@/pages/admin/lms/assignments/lms-assignments.page'
import LMSAssignmentsMentorPage from '@/pages/mentor/lms/assignments/lms-assignments-mentor.page'
import AssignmentPage from '@/pages/shared/lms/$lmsCode/assignments'
import LMSAssignmentsStudentPage from '@/pages/student/lms/assignments/lms-assignments-student.page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsAssignmentStateSearchSchema = z.object({
  view: z.uuidv4().optional(),
})

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/assignments/',
)({
  component: RouteComponent,
  pendingComponent: Loader,
  validateSearch: lmsAssignmentStateSearchSchema,
})

function RouteComponent() {
  const {
    authUser: { role },
  } = useAuth('protected')

  return (
    // <AssignmentPage />
    <RoleComponentManager
      currentRole={role}
      roleRender={{
        admin: <LMSAssignmentsPage />,
        student: <LMSAssignmentsStudentPage />,
        mentor: <LMSAssignmentsMentorPage />,
      }}
    />
  )
}
