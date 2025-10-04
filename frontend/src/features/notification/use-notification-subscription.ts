import {
  type NotificationCountDto,
  type NotificationItemDto,
  type PaginatedNotificationDto,
} from '@/integrations/api/client'
import {
  notificationsControllerFindAllQueryKey,
  notificationsControllerGetCountQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useEffect } from 'react'
import { useSSE } from '../sse/sse-provider'

export const useNotificationSubscription = () => {
  const { queryClient } = getContext()
  const { subscribe } = useSSE()

  useEffect(() => {
    const unsubscribe = subscribe('/notifications/subscribe', (event) => {
      try {
        const data: NotificationItemDto = JSON.parse(event.data)

        queryClient.setQueryData<PaginatedNotificationDto>(
          notificationsControllerFindAllQueryKey({}),
          (old) => {
            if (!old)
              return {
                notifications: [data],
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

            const exists = old.notifications.some((item) => item.id === data.id)
            if (exists) return old

            return {
              ...old,
              notifications: [data, ...old.notifications],
              meta: {
                ...old.meta,
                totalCount: old.meta.totalCount + 1,
              },
            }
          },
        )

        queryClient.setQueryData<NotificationCountDto>(
          notificationsControllerGetCountQueryKey(),
          (old) => {
            if (!old) return { total: 1, read: 0, unread: 1 }

            return {
              ...old,
              total: old.total + 1,
              unread: old.unread + 1,
            }
          },
        )
      } catch (err) {
        console.error('Notification SSE parse error', err)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])
}
