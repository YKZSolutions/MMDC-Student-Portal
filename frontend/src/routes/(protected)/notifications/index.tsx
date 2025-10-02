import { Loader } from '@/components/loader-component'
import NotificationPage from '@/pages/shared/notification/notification-page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const NotificationType = ['read', 'unread'] as const

const notificationStateSearchSchema = z.object({
  type: z.enum(NotificationType).optional(),
})

export const Route = createFileRoute('/(protected)/notifications/')({
  component: RouteComponent,
  pendingComponent: Loader,
  validateSearch: notificationStateSearchSchema,
})

function RouteComponent() {
  return <NotificationPage />
}
