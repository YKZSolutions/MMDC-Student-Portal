import type { QueryKey as ClientQueryKey } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { Options } from '@/integrations/api/client/client'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import {
  useAppMutation,
  type NotificationMessages,
} from '@/integrations/tanstack-query/useAppMutation'
import { toastMessage } from '@/utils/toast-message'
import { useForm, type UseFormInput } from '@mantine/form'
import {
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useEffect } from 'react'

interface QuickFormHookOptions<
  TFormInput extends Record<string, any>,
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TInvalidateQueryKeyOptions extends Options,
  TCreateData,
  TCreateError,
  TCreateVars,
  TCreateContext,
  TUpdateData,
  TUpdateError,
  TUpdateVars,
  TUpdateContext,
> {
  name: string
  formOptions: UseFormInput<TFormInput>
  transformQueryData?: (data: TData) => Partial<TFormInput>
  queryOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
  queryKeyInvalidation: [ClientQueryKey<TInvalidateQueryKeyOptions>[0]]
  createMutationOptions: UseMutationOptions<
    TCreateData,
    TCreateError,
    TCreateVars,
    TCreateContext
  >
  updateMutationOptions: UseMutationOptions<
    TUpdateData,
    TUpdateError,
    TUpdateVars,
    TUpdateContext
  >
  customToastMessage?: {
    create?: NotificationMessages
    update?: NotificationMessages
  }
}

export function useQuickForm<
  TFormInput extends Record<string, any>,
  TFormOutput extends Record<string, any>,
>() {
  return function <
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TInvalidateQueryKeyOptions extends Options = Options,
    TCreateData = unknown,
    TCreateError = Error,
    TCreateVars = void,
    TCreateContext = unknown,
    TUpdateData = unknown,
    TUpdateError = Error,
    TUpdateVars = void,
    TUpdateContext = unknown,
  >({
    name,
    queryOptions,
    createMutationOptions,
    updateMutationOptions,
    queryKeyInvalidation,
    formOptions,
    transformQueryData,
    customToastMessage,
  }: QuickFormHookOptions<
    TFormInput,
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TInvalidateQueryKeyOptions,
    TCreateData,
    TCreateError,
    TCreateVars,
    TCreateContext,
    TUpdateData,
    TUpdateError,
    TUpdateVars,
    TUpdateContext
  >) {
    const query = useQuery(queryOptions)

    const create = useAppMutation(
      () => ({ mutationFn: createMutationOptions.mutationFn }),
      customToastMessage?.create ??
        toastMessage(
          name,
          'creating',
          'created',
          Boolean(customToastMessage?.create),
        ),
      {
        ...createMutationOptions,
        onSuccess: (data, vars, ctx) => {
          const { queryClient } = getContext()
          queryClient.invalidateQueries({ queryKey: queryKeyInvalidation })
          createMutationOptions.onSuccess?.(data, vars, ctx)
        },
      },
    )

    const update = useAppMutation(
      () => ({ mutationFn: updateMutationOptions.mutationFn }),
      customToastMessage?.update ??
        toastMessage(
          name,
          'updating',
          'updated',
          Boolean(customToastMessage?.update),
        ),
      {
        ...updateMutationOptions,
        onSuccess: (data, vars, ctx) => {
          const { queryClient } = getContext()
          queryClient.invalidateQueries({ queryKey: queryKeyInvalidation })
          updateMutationOptions.onSuccess?.(data, vars, ctx)
        },
      },
    )

    const form = useForm<TFormInput>({
      mode: 'uncontrolled',
      ...formOptions,
    })

    useEffect(() => {
      if (query?.data && transformQueryData) {
        form.setValues(transformQueryData(query.data))
      }
    }, [query?.data])

    const isPending =
      query?.isLoading || create.isPending || update.isPending || false

    return {
      query,
      create,
      update,
      form: {
        ...form,
        getValues: () => form.getValues() as unknown as TFormOutput,
      },
      isPending,
    }
  }
}
