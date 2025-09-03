import { useDebouncedCallback } from '@mantine/hooks'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

type QueryShape = Record<string, any>

interface UseSearchQueryOptions<T extends QueryShape> {
  route: any // Tanstack Router route
  defaultValues: T
  debounceMs?: number
  path?: string
}

export function useSearchQuery<T extends QueryShape>({
  route,
  defaultValues,
  debounceMs = 200,
  path,
}: UseSearchQueryOptions<T>) {
  const searchParam = route.useSearch()
  const navigate = useNavigate()

  // merge search params into defaults for initial state
  const queryDefaultValues = {
    ...defaultValues,
    ...searchParam,
  }

  const [query, setQuery] = useState<T>(queryDefaultValues as T)

  const debouncedQuery = useMemo(
    () => ({ ...query, ...searchParam }),
    [query, searchParam],
  )

  console.log(debouncedQuery)

  const debouncedNavigate = useDebouncedCallback(
    (key: keyof T, value: T[keyof T]) => {
      navigate({
        to: path || route.fullPath,
        search: ((prev: Record<string, any>) => ({
          ...prev,
          [key as string]: value || undefined,
        })) as any,
      })
    },
    debounceMs,
  )

  const handleChange = (key: keyof T, value: T[keyof T]) => {
    // update UI immediately
    setQuery((prev) => ({ ...prev, [key]: value }))
    // update the route (debounced)
    debouncedNavigate(key, value)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key?: keyof T,
  ) => {
    const k = (key ?? ('search' as unknown)) as keyof T
    handleChange(k, e.target.value as unknown as T[keyof T])
  }

  return {
    query,
    setQuery,
    debouncedQuery,
    handleChange,
    handleInputChange,
  }
}

/**
 * For Documentation Purposes, here is the old implementation
 */

// const queryDefaultValues = {
//   search: searchParam.search || '',
//   page: 1,
//   role: searchParam.role || null,
// }

// const [query, setQuery] = useState<IUsersQuery>(queryDefaultValues)

// // Since searchParam is debounced,
// // this is what we need to pass to the query provider
// // This will ensure that the query is also debounced
// const debouncedQuery = {
//   search: searchParam.search || '',
//   page: query.page,
//   role: query.role,
// } as IUsersQuery

// const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value

//   setQuery((prev) => ({
//     ...prev,
//     search: value,
//   }))

//   handleNavigate(value)
// }

// const handleNavigate = useDebouncedCallback(async (value: string) => {
//   navigate({
//     to: '/users',
//     search: (prev) => ({
//       ...prev,
//       search: value.trim() || undefined,
//     }),
//   })
// }, 200)
