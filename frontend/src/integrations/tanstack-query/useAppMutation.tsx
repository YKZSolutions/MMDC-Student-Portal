import type { ApiErrorResponse } from '@/features/validation/api-error.schema'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useRef } from 'react'
import { getContext } from './root-provider'

export type NotificationMessages = {
  loading: { title: string; message: string }
  success: { title: string; message: string }
  error?: { title: string; message?: string } // The field is optional (using `?:`), not nullable. Omitting `message` allows error messages from the server to be displayed.
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
  const notifId = useRef<string>('')

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
        autoClose: 2000,
      })

      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context)
      }
    },
    onError: (error, variables, context) => {
      // assume TError is ApiErrorResponse for error handling
      const err = error as ApiErrorResponse

      notifications.update({
        id: notifId.current,
        color: 'red',
        title: messages.error?.title ?? 'Something went wrong',
        message:
          messages.error?.message ?? err.error ?? 'Please try again later.',
        icon: <IconX size={18} />,
        loading: false,
        autoClose: err.error ? 5000 : 3000, // longer if there's a specific error message
      })

      if (options?.onError) {
        return options.onError(error, variables, context)
      }
    },
    onSettled: (data, error, variables, context) => {
      // treat context as unknown-safe when checking for custom keys
      const ctxAny = context as unknown as
        | { keys?: Record<string, unknown> }
        | undefined

      const { queryClient } = getContext()
      if (ctxAny?.keys) {
        for (const val of Object.values(ctxAny.keys)) {
          if (val == null) continue

          // if the value is already a queryKey array, use it; otherwise wrap a single value
          const keyArr = Array.isArray(val)
            ? (val as readonly unknown[])
            : ([val] as readonly unknown[])
          queryClient.invalidateQueries({ queryKey: keyArr })
        }
      }

      if (options?.onSettled) {
        return options.onSettled(data, error, variables, context)
      }
    },
  })
}
