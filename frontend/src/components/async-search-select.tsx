import { useState, useEffect } from 'react'
import {
  Select,
  Loader,
  type SelectProps,
  type ComboboxItem,
} from '@mantine/core'
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
  TItemData = unknown,
  TItemQueryKey extends QueryKey = QueryKey,
> = {
  /** Function that returns query options based on search string */
  getOptions: (
    search: string,
  ) => Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'enabled'>
  /** Map results into Mantine { value, label } format */
  mapData: (data: TData) => { value: string; label: string }[]
  /** For update forms: Initial value (ID) */
  initialValue?: string
  /** For update forms: Function to get a single item by ID */
  getItemById?: (
    id: string,
  ) => Omit<
    UseQueryOptions<TItemData, TError, TItemData, TItemQueryKey>,
    'enabled'
  >
  /** For update forms: Map single item to label */
  mapItem?: (item: TItemData) => { value: string; label: string }
  /** Minimum chars before fetching */
  minChars?: number
  /** Debounce ms */
  debounceMs?: number
  /** Preload options when select is focused, without typing */
  preloadOptions?: boolean
  /** Select first option automatically when dropdown changes */
  selectFirstOptionOnChange?: boolean
} & Omit<SelectProps, 'data'>

export default function AsyncSearchSelect<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TItemData = unknown,
  TItemQueryKey extends QueryKey = QueryKey,
>({
  getOptions,
  mapData,
  initialValue,
  getItemById,
  mapItem,
  minChars = 1,
  debounceMs = 300,
  preloadOptions = false,
  selectFirstOptionOnChange = false,
  onChange,
  ...props
}: AsyncSelectProps<
  TQueryFnData,
  TError,
  TData,
  TQueryKey,
  TItemData,
  TItemQueryKey
>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, debounceMs)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string | null>(
    initialValue || null,
  )

  // Query for searching options
  const queryOptions = getOptions(debouncedSearch)
  const { data: searchData, isFetching: isSearching } = useQuery({
    ...queryOptions,
    enabled:
      (preloadOptions && isFocused) || debouncedSearch.length >= minChars,
  })

  // Query for fetching initial item details (if needed)
  const { data: initialItemData, isFetching: isLoadingInitial } = useQuery({
    ...(getItemById && initialValue
      ? getItemById(initialValue)
      : {
          queryKey: ['__placeholder__'] as any,
          queryFn: () => {
            return {} as TItemData
          },
        }),
    enabled: !!getItemById && !!initialValue && !!initialValue.trim(),
  })

  // Handle changes to the select
  const handleChange = (value: string | null, option: ComboboxItem) => {
    setSelectedValue(value)
    if (onChange) {
      onChange(value, option)
    }
  }

  // Reset focus state when component unmounts
  useEffect(() => {
    return () => setIsFocused(false)
  }, [])

  // Update selectedValue when initialValue changes
  useEffect(() => {
    if (initialValue !== undefined) {
      setSelectedValue(initialValue || null)
    }
  }, [initialValue])

  // Prepare data for the dropdown
  let selectData: { value: string; label: string }[] = []

  // Include search results
  if (searchData) {
    selectData = mapData(searchData)
  }

  // Include initial item if we have it and it's not already in search results
  if (initialValue && initialItemData && mapItem) {
    const initialOption = mapItem(initialItemData)
    if (!selectData.some((item) => item.value === initialOption.value)) {
      selectData = [initialOption, ...selectData]
    }
  }

  // Create placeholder text
  const placeholder = isLoadingInitial
    ? 'Loading initial value...'
    : props.placeholder

  return (
    <Select
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      data={selectData}
      value={selectedValue}
      onChange={handleChange}
      nothingFoundMessage={
        isSearching || isLoadingInitial
          ? 'Loading...'
          : !preloadOptions && debouncedSearch.length < minChars
            ? `Type at least ${minChars} character${minChars > 1 ? 's' : ''}`
            : 'No results'
      }
      rightSection={
        isSearching || isLoadingInitial ? <Loader size="xs" /> : null
      }
      onDropdownOpen={() => setIsFocused(true)}
      onDropdownClose={() => setIsFocused(false)}
      placeholder={placeholder}
      selectFirstOptionOnChange={selectFirstOptionOnChange}
      {...props}
    />
  )
}
