import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { toastMessage } from '@/utils/toast-message'
import { type UseMutationOptions } from '@tanstack/react-query'
import type { QueryKey as ClientQueryKey } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { Options } from '@/integrations/api/client/client'

interface QuickActionHookOptions<
  TInvalidateQueryKeyOptions extends Options,
  TDeleteData,
  TDeleteError,
  TDeleteVars,
  TDeleteContext,
> {
  name: string
  queryKeyInvalidation: [ClientQueryKey<TInvalidateQueryKeyOptions>[0]]
  removeMutationOptions: UseMutationOptions<
    TDeleteData,
    TDeleteError,
    TDeleteVars,
    TDeleteContext
  >
}

export function useQuickAction<
  TInvalidateQueryKeyOptions extends Options = Options,
  TDeleteData = unknown,
  TDeleteError = Error,
  TDeleteVars = void,
  TDeleteContext = unknown,
>({
  name,
  queryKeyInvalidation,
  removeMutationOptions,
}: QuickActionHookOptions<
  TInvalidateQueryKeyOptions,
  TDeleteData,
  TDeleteError,
  TDeleteVars,
  TDeleteContext
>) {
  const remove = useAppMutation(
    () => ({ mutationFn: removeMutationOptions.mutationFn }),
    toastMessage(name, 'deleting', 'deleted'),
    {
      ...removeMutationOptions,
      onSuccess: (data, vars, ctx) => {
        const { queryClient } = getContext()
        queryClient.invalidateQueries({ queryKey: queryKeyInvalidation })
        removeMutationOptions.onSuccess?.(data, vars, ctx)
      },
    },
  )

  const isPending = remove.isPending

  return {
    remove,
    isPending,
  }
}
