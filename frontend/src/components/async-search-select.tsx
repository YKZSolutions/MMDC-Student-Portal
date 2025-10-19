import {
  Loader,
  Select,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * Base option type for async select options
 * @template TItemData - The type of the full data object
 */
type BaseAsyncSelectOption<TItemData> = {
  value: string
  label: string
  data?: TItemData
}

/**
 * Option type with auto-inferred additional fields
 * @template TItemData - The type of the full data object
 * @template TExtendedFields - Additional fields beyond value and label (auto-inferred)
 * 
 * @example
 * ```tsx
 * // Extended fields are automatically available in renderOption and onChange
 * mapData={(data) => data.users.map(user => ({
 *   value: user.id,
 *   label: user.name,
 *   email: user.email, // Extended field - will be typed!
 * }))}
 * 
 * renderOption={({ option }) => (
 *   <div>
 *     {option.label}
 *     {option.email} // TypeScript knows this exists!
 *   </div>
 * )}
 * ```
 */
export type AsyncSelectOption<TItemData, TExtendedFields = {}> =
  BaseAsyncSelectOption<TItemData> & TExtendedFields


/**
 * Props for AsyncSearchSelect component with auto-inferred extended fields
 * 
 * @template TQueryFnData - The raw data type returned by the query function
 * @template TError - The error type for queries
 * @template TData - The transformed data type (after select/transform)
 * @template TQueryKey - The query key type
 * @template TItemData - The type of individual item data
 * @template TItemQueryKey - The query key type for single item queries
 * @template TExtendedFields - Additional fields added to options (auto-inferred from mapData/mapItem)
 * 
 * @example
 * ```tsx
 * // Explicitly declare extended fields for full type safety
 * <AsyncSearchSelect<
 *   { users: User[] },
 *   Error,
 *   { users: User[] },
 *   string[],
 *   User,
 *   string[],
 *   { email?: string } // Extended fields
 * >
 *   mapData={(data) => data.users.map(user => ({
 *     value: user.id,
 *     label: user.name,
 *     email: user.email, // This field is now typed!
 *   }))}
 *   renderOption={({ option }) => (
 *     <div>
 *       {option.label}
 *       {option.email} // TypeScript knows about this!
 *     </div>
 *   )}
 * />
 * ```
 */
export type AsyncSelectProps<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TItemData = unknown,
  TItemQueryKey extends QueryKey = QueryKey,
  TExtendedFields = {},
> = {
  /** Function that returns query options based on search string */
  getOptions: (
    search: string,
  ) => Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'enabled'>
  /** 
   * Map results into Mantine { value, label, data? } format with optional extended fields
   * Extended fields will be automatically available in renderOption and onChange
   */
  mapData: (data: TData) => (BaseAsyncSelectOption<TItemData> & TExtendedFields)[]
  /** For update forms: Initial value (ID) */
  initialValue?: string
  /** For update forms: Function to get a single item by ID */
  getItemById?: (
    id: string,
  ) => Omit<
    UseQueryOptions<TItemData, TError, TItemData, TItemQueryKey>,
    'enabled'
  >
  /** 
   * For update forms: Map single item to label with optional extended fields
   * Extended fields should match those in mapData
   */
  mapItem?: (item: TItemData) => BaseAsyncSelectOption<TItemData> & TExtendedFields
  /** Minimum chars before fetching (default: 1) */
  minChars?: number
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number
  /** Preload options when select is focused, without typing (default: false) */
  preloadOptions?: boolean
  /** Select first option automatically when dropdown changes (default: false) */
  selectFirstOptionOnChange?: boolean
  /** 
   * Optional render component with access to extended fields
   * The option parameter will include all extended fields defined in mapData/mapItem
   */
  renderOption?: (
    option: ComboboxLikeRenderOptionInput<
      ComboboxItem & BaseAsyncSelectOption<TItemData> & TExtendedFields
    >,
    data: TData,
  ) => ReactNode
  /** 
   * onChange callback with access to extended fields
   * The option parameter will include all extended fields defined in mapData/mapItem
   */
  onChange?: (
    value: string | null,
    option: ComboboxItem & BaseAsyncSelectOption<TItemData> & TExtendedFields,
    data?: TItemData | null,
  ) => void
} & Omit<SelectProps, 'data' | 'renderOption' | 'onChange'>

/**
 * Async Search Select Component
 * 
 * A Mantine Select component with async data fetching, debouncing, and support for extended fields.
 * 
 * Features:
 * - Async data fetching with React Query
 * - Debounced search input
 * - Preload options on focus
 * - Initial value support for update forms
 * - Auto-inferred extended fields (beyond value and label)
 * 
 * @example
 * ```tsx
 * <AsyncSearchSelect<
 *   { users: User[] },
 *   Error,
 *   { users: User[] },
 *   string[],
 *   User,
 *   string[],
 *   { email?: string } // Extended field
 * >
 *   getOptions={() => ({
 *     queryKey: ['users'],
 *     queryFn: async () => ({ users: [] })
 *   })}
 *   mapData={(data) => data.users.map(user => ({
 *     value: user.id,
 *     label: user.name,
 *     email: user.email // Extended field - will be available in renderOption!
 *   }))}
 *   renderOption={({ option }) => (
 *     <div>
 *       <div>{option.label}</div>
 *       <div>{option.email}</div> // TypeScript knows this exists!
 *     </div>
 *   )}
 * />
 * ```
 */
export default function AsyncSearchSelect<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TItemData = unknown,
  TItemQueryKey extends QueryKey = QueryKey,
  TExtendedFields = {},
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
  TItemQueryKey,
  TExtendedFields
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
  let selectData: (BaseAsyncSelectOption<TItemData> & TExtendedFields)[] = []

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
      // Merge the ComboboxItem with the matched option to include extended fields
      const enrichedOption = {
        ...option,
        ...(matchedOption || {}),
      } as ComboboxItem & BaseAsyncSelectOption<TItemData> & TExtendedFields
      onChange(value, enrichedOption, matchedOption?.data ?? null)
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
          ? (option) => {
              // Enrich the option with extended fields from selectData
              const matchedData = selectData.find(
                (item) => item.value === option.option.value,
              )
              const enrichedOption = {
                ...option,
                option: { ...option.option, ...(matchedData || {}) },
              } as ComboboxLikeRenderOptionInput<
                ComboboxItem & BaseAsyncSelectOption<TItemData> & TExtendedFields
              >
              return renderOption(enrichedOption, searchData)
            }
          : undefined
      }
      {...props}
    />
  )
}
