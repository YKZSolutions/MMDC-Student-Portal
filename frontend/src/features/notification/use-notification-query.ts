import type {
  NotificationCountDto,
  NotificationsControllerFindAllData,
  PaginatedNotificationDto,
} from '@/integrations/api/client'
import {
  notificationsControllerFindAllOptions,
  notificationsControllerFindAllQueryKey,
  notificationsControllerGetCountOptions,
  notificationsControllerGetCountQueryKey,
  notificationsControllerMarkAllAsReadMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import type { Options } from '@/integrations/api/client/client'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

export const useNotificationQuery = (
  options?: Options<NotificationsControllerFindAllData> | undefined,
) => {
  const { queryClient } = getContext()

  const { data: count } = useSuspenseQuery(
    notificationsControllerGetCountOptions(),
  )
  const { data: paginated } = useSuspenseQuery(
    notificationsControllerFindAllOptions(options),
  )

  const { mutateAsync: markAllAsRead } = useMutation({
    ...notificationsControllerMarkAllAsReadMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationsControllerFindAllQueryKey(),
      })
      await queryClient.cancelQueries({
        queryKey: notificationsControllerGetCountQueryKey(),
      })

      queryClient.setQueryData<PaginatedNotificationDto>(
        notificationsControllerFindAllQueryKey(),
        (old) => {
          if (!old)
            return {
              notifications: [],
              meta: {
                isFirstPage: true,
                isLastPage: true,
                currentPage: 1,
                previousPage: null,
                nextPage: null,
                pageCount: 1,
                totalCount: 1,
              },
            }

          return {
            ...old,
            notifications: old.notifications.map((notification) => {
              if (notification.isRead) return notification
              return {
                ...notification,
                isRead: true,
              }
            }),
          }
        },
      )

      queryClient.setQueryData<NotificationCountDto>(
        notificationsControllerGetCountQueryKey(),
        (old) => {
          if (!old) return { total: 0, read: 0, unread: 0 }

          return {
            ...old,
            unread: 0,
          }
        },
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsControllerFindAllQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: notificationsControllerGetCountQueryKey(),
      })
    },
  })

  return {
    paginated,
    count,
    markAllAsRead,
  }
}
