import {
  CloseButton,
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  Text,
  useCombobox,
  type InputBaseProps,
} from '@mantine/core'
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { useDebouncedValue, useInputState } from '@mantine/hooks'

export interface AsyncSearchableProps<
  TQueryFnData,
  TError,
  TQueryData,
  TQueryKey extends QueryKey,
  TItemData,
> extends Omit<
    InputBaseProps,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'component'
  > {
  getOptions: (
    search: string,
  ) => Omit<
    UseQueryOptions<TQueryFnData, TError, TQueryData, TQueryKey>,
    'enabled'
  >
  mapData: (data: TQueryData) => TItemData[]
  getValue: (data: TItemData) => string
  getLabel: (data: TItemData) => string
  renderOption?: (item: TItemData) => ReactNode
  renderValue?: (item: TItemData | null) => ReactNode
  value: TItemData | null
  onChange?: (val: TItemData | null) => void
  limit?: number
  clearable?: boolean
  selectFirstOption?: boolean
  emptyMessage?: ReactNode
  placeholder?: string
}

export function AsyncSearchable<
  TQueryFnData = unknown,
  TError = Error,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TItemData = unknown,
>({
  value,
  onChange,
  getOptions,
  mapData,
  renderOption,
  renderValue,
  getValue,
  getLabel,
  limit = 5,
  clearable = true,
  selectFirstOption = false,
  emptyMessage,
  placeholder,
  ...inputProps
}: AsyncSearchableProps<
  TQueryFnData,
  TError,
  TQueryData,
  TQueryKey,
  TItemData
>) {
  const [search, setSearch] = useInputState('')
  const [debounced] = useDebouncedValue(search, 300)

  const combobox = useCombobox({
    onDropdownOpen: () => {
      if (selectFirstOption) combobox.selectFirstOption()
      if (renderValue) combobox.focusSearchInput()
    },
  })

  const queryOptions = getOptions(debounced)
  const { data: searchData, isFetching: isSearching } = useQuery({
    ...queryOptions,
    enabled: combobox.dropdownOpened,
  })

  const options = (mapData(searchData ?? ({} as TQueryData)) ?? []).slice(
    0,
    limit,
  )

  useEffect(() => {
    if (selectFirstOption && combobox.dropdownOpened && options.length > 0) {
      combobox.selectFirstOption()
    }
  }, [options, combobox.dropdownOpened, selectFirstOption])

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    setSearch('')
    onChange?.(null)
  }

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        const found = options.find((item) => getValue(item) === val) || null
        onChange?.(found)
        setSearch('')
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        {renderValue ? (
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={
              clearable && (value || search) ? (
                <CloseButton
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  aria-label="Clear"
                />
              ) : null
            }
            w="100%"
            size={inputProps.size ?? 'sm'}
            radius={inputProps.radius ?? 'sm'}
            multiline
            onClick={() => combobox.toggleDropdown()}
            {...inputProps}
          >
            {value ? (
              renderValue(value)
            ) : (
              <Input.Placeholder>
                {placeholder || 'Select...'}
              </Input.Placeholder>
            )}
          </InputBase>
        ) : (
          <InputBase
            placeholder={placeholder || 'Search...'}
            value={search.length === 0 && value ? getLabel(value) : search}
            onChange={(e) => {
              combobox.openDropdown()
              combobox.updateSelectedOptionIndex()
              setSearch(e)
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              combobox.closeDropdown()
              setSearch('')
            }}
            rightSection={
              clearable && (value || search) ? (
                <CloseButton
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  aria-label="Clear"
                />
              ) : (
                <Combobox.Chevron />
              )
            }
            rightSectionPointerEvents={
              clearable && (value || search) ? 'all' : 'none'
            }
            {...inputProps}
          />
        )}
      </Combobox.Target>

      <Combobox.Dropdown>
        {renderValue ? (
          <Combobox.Search
            value={search}
            onChange={(e) => setSearch(e)}
            placeholder="Search..."
          />
        ) : null}
        <Combobox.Options>
          {isSearching ? (
            <Group p="xs" justify="center">
              <Loader size="sm" />
            </Group>
          ) : options.length === 0 ? (
            emptyMessage ? (
              emptyMessage
            ) : (
              <Group p="xs" justify="center">
                <Text size="sm" c="dimmed">
                  No Results
                </Text>
              </Group>
            )
          ) : (
            options.map((item) => (
              <Combobox.Option key={getValue(item)} value={getValue(item)}>
                {renderOption ? renderOption(item) : getLabel(item)}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
