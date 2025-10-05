import { ActionIcon, Card, Divider, Group, Stack } from '@mantine/core'
import { IconMinus, IconSearch } from '@tabler/icons-react'
import { type QueryKey } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AsyncSearchable, type AsyncSearchableProps } from './async-searchable'

export interface AsyncSelectListProps<
  TQueryFnData,
  TError,
  TQueryData,
  TQueryKey extends QueryKey,
  TItemData,
> extends Pick<
    AsyncSearchableProps<
      TQueryFnData,
      TError,
      TQueryData,
      TQueryKey,
      TItemData
    >,
    | 'getOptions'
    | 'mapData'
    | 'getValue'
    | 'getLabel'
    | 'renderOption'
    | 'placeholder'
    | 'label'
    | 'withAsterisk'
  > {
  value?: TItemData[]
  onChange?: (items: TItemData[]) => void

  items?: TItemData[]
  onAdd?: (item: TItemData) => void
  onRemove?: (item: TItemData) => void
  renderItem: (item: TItemData) => ReactNode

  disabled?: boolean
  allowDuplicates?: boolean
}

export function AsyncSelectList<
  TQueryFnData = unknown,
  TError = Error,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TItemData = unknown,
>({
  getOptions,
  mapData,
  getLabel,
  getValue,
  renderOption,
  label,
  placeholder = 'Search',
  value,
  onChange,
  items: itemsProp,
  onAdd,
  onRemove,
  renderItem,
  disabled = false,
  allowDuplicates = false,
}: AsyncSelectListProps<
  TQueryFnData,
  TError,
  TQueryData,
  TQueryKey,
  TItemData
>) {
  const items = value ?? itemsProp ?? []

  const handleAdd = (item: TItemData | null) => {
    if (!item) return

    let newItems = allowDuplicates
      ? [...items, item]
      : [...items, item].filter(
          (val, idx, arr) =>
            arr.findIndex((i) => getValue(i) === getValue(val)) === idx,
        )

    onChange?.(newItems)

    onAdd?.(item)
  }

  const handleRemove = (newItem: TItemData) => {
    const newItems = items.filter(
      (item) => getValue(item) !== getValue(newItem),
    )

    onChange?.(newItems)

    onRemove?.(newItem)
  }

  return (
    <Stack>
      <AsyncSearchable
        value={null}
        onChange={handleAdd}
        getOptions={getOptions}
        mapData={(data) => {
          const all = mapData(data) ?? []
          if (allowDuplicates) return all
          const selectedIds = new Set(items.map((i) => getValue(i)))
          return all.filter((item) => !selectedIds.has(getValue(item)))
        }}
        getValue={getValue}
        getLabel={getLabel}
        placeholder={placeholder}
        renderOption={renderOption}
        disabled={disabled}
        selectFirstOption
        rightSection={null}
        leftSection={<IconSearch size={16} />}
        label={label}
      />

      <Stack gap="xs">
        {items.map((item) => (
          <Group key={getValue(item)}>
            <Card radius="md" py={8} withBorder flex={1}>
              {renderItem?.(item)}
            </Card>
            <ActionIcon
              size="sm"
              variant="outline"
              radius="lg"
              onClick={() => handleRemove(item)}
              disabled={disabled}
            >
              <IconMinus />
            </ActionIcon>
          </Group>
        ))}
        <Divider />
      </Stack>
    </Stack>
  )
}
