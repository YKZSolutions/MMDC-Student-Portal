import { useState, useEffect, type ReactNode } from 'react'
import {
  Select,
  Loader,
  type SelectProps,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
} from '@mantine/core'
import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks'

/** Option type with optional full data object */
export type AsyncSelectOption<TItemData> = {
  value: string
  label: string
  data?: TItemData
}

export type AsyncSelectProps<
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
  /** Map results into Mantine { value, label, data? } format */
  mapData: (data: TData) => AsyncSelectOption<TItemData>[]
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
  mapItem?: (item: TItemData) => AsyncSelectOption<TItemData>
  /** Minimum chars before fetching */
  minChars?: number
  /** Debounce ms */
  debounceMs?: number
  /** Preload options when select is focused, without typing */
  preloadOptions?: boolean
  /** Select first option automatically when dropdown changes */
  selectFirstOptionOnChange?: boolean
  /** Optional render component */
  renderOption?: (
    option: ComboboxLikeRenderOptionInput<ComboboxItem>,
    data: TData,
  ) => ReactNode
  /** onChange now returns full data object */
  onChange?: (
    value: string | null,
    option: ComboboxItem,
    data?: TItemData | null,
  ) => void
} & Omit<SelectProps, 'data' | 'renderOption' | 'onChange'>

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
  renderOption,
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

  // Prepare data for the dropdown
  let selectData: AsyncSelectOption<TItemData>[] = []

  if (searchData) {
    selectData = mapData(searchData)
  }

  if (initialValue && initialItemData && mapItem) {
    const initialOption = mapItem(initialItemData)
    if (!selectData.some((item) => item.value === initialOption.value)) {
      selectData = [initialOption, ...selectData]
    }
  }

  // Handle selection changes
  const handleChange = (value: string | null, option: ComboboxItem) => {
    setSelectedValue(value)
    if (onChange) {
      const matchedOption = selectData.find((item) => item.value === value)
      onChange(value, option, matchedOption?.data ?? null)
    }
  }

  useEffect(() => {
    return () => setIsFocused(false)
  }, [])

  useEffect(() => {
    if (initialValue !== undefined) {
      setSelectedValue(initialValue || null)
    }
  }, [initialValue])

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
      renderOption={
        renderOption && searchData
          ? (option) => renderOption(option, searchData)
          : undefined
      }
      {...props}
    />
  )
}
