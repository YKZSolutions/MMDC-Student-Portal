import { useState, useEffect } from 'react'
import { Select, Loader, type SelectProps } from '@mantine/core'
import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks'

type AsyncSelectProps<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = {
  /** Function that returns query options based on search string */
  getOptions: (
    search: string,
  ) => Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'enabled'>
  /** Map results into Mantine { value, label } format */
  mapData: (data: TData) => { value: string; label: string }[]
  /** Minimum chars before fetching */
  minChars?: number
  /** Debounce ms */
  debounceMs?: number
  /** Preload options when select is focused, without typing */
  preloadOptions?: boolean
} & Omit<SelectProps, 'data'>

export default function AsyncSearchSelect<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  getOptions,
  mapData,
  minChars = 1,
  debounceMs = 300,
  preloadOptions = false,
  ...props
}: AsyncSelectProps<TQueryFnData, TError, TData, TQueryKey>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, debounceMs)
  const [isFocused, setIsFocused] = useState(false)

  const queryOptions = getOptions(debouncedSearch)

  const { data, isFetching } = useQuery({
    ...queryOptions,
    enabled:
      (preloadOptions && isFocused) || debouncedSearch.length >= minChars,
  })

  // Reset focus state when component unmounts
  useEffect(() => {
    return () => setIsFocused(false)
  }, [])

  return (
    <Select
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      data={data ? mapData(data) : []}
      nothingFoundMessage={
        isFetching
          ? 'Loading...'
          : !preloadOptions && debouncedSearch.length < minChars
            ? `Type at least ${minChars} character${minChars > 1 ? 's' : ''}`
            : 'No results'
      }
      rightSection={isFetching ? <Loader size="xs" /> : null}
      onDropdownOpen={() => setIsFocused(true)}
      onDropdownClose={() => setIsFocused(false)}
      {...props}
    />
  )
}
