import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import AppointmentDetails from '@/pages/shared/appointment/appointment-details'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/appointment/$appointmentId')(
  {
    component: RouteComponent,
    pendingComponent: Loader,
  },
)

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <AppointmentDetails />,
        mentor: <AppointmentDetails />,
      }}
    />
  )
}
