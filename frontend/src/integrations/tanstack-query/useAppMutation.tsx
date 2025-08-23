import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query'
import { useRef } from 'react'

type NotificationMessages = {
  loading: { title: string; message: string }
  success: { title: string; message: string }
  error?: { title: string; message: string }
}

export function useAppMutation<TData, TError, TVariables, TContext>(
  mutationFactory: () => {
    mutationFn?: (variables: TVariables) => Promise<TData>
  },
  messages: NotificationMessages,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const notifId = useRef<string>("");

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutationFactory().mutationFn as (
      variables: TVariables,
    ) => Promise<TData>,
    ...options,
    onMutate: async (variables) => {
      notifId.current = notifications.show({
        id: notifId.current,
        loading: true,
        title: messages.loading.title,
        message: messages.loading.message,
        autoClose: false,
        withCloseButton: false,
      })

      if (options?.onMutate) {
        return options.onMutate(variables)
      }
    },
    onSuccess: async (data, variables, context) => {
      notifications.update({
        id: notifId.current,
        color: 'teal',
        title: messages.success.title,
        message: messages.success.message,
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 1500,
      })

      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context)
      }
    },
    onError: (error, variables, context) => {
      notifications.update({
        id: notifId.current,
        color: 'red',
        title: messages.error?.title ?? 'Something went wrong',
        message: messages.error?.message ?? 'Please try again later.',
        icon: <IconX size={18} />,
        loading: false,
        autoClose: 3000,
      })

      if (options?.onError) {
        return options.onError(error, variables, context)
      }
    },
  })
}
