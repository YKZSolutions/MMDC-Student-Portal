import { Loader } from '@/components/loader-component'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import AppointmentPage from '@/pages/shared/appointment/appointment-page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const appointmentStatusFilter = ['upcoming', 'finished', 'cancelled'] as const

export type AppointmentStatusFilter = (typeof appointmentStatusFilter)[number]

const appointmentStateSearchSchema = z.object({
  status: z.enum(appointmentStatusFilter).optional(),
  bookAppointment: z.boolean().optional(),
})

export type AppointmentStateSearch = z.infer<
  typeof appointmentStateSearchSchema
>

export const Route = createFileRoute('/(protected)/appointment/')({
  component: RouteComponent,
  loader: Loader,
  validateSearch: appointmentStateSearchSchema,
})

function RouteComponent() {
  const { authUser } = useAuth('protected')

  return (
    <RoleComponentManager
      currentRole={authUser.role}
      roleRender={{
        student: <AppointmentPage />,
        mentor: <AppointmentPage />,
      }}
    />
  )
}
