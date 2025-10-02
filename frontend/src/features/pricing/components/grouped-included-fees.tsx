import type { PricingDto } from '@/integrations/api/client'
import { pricingControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Card,
  Combobox,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { useDebouncedValue, useInputState } from '@mantine/hooks'
import { IconMinus, IconSearch } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'

export interface GroupedIncludedFeesFormProps {
  disabled: boolean
  defaultFees?: PricingDto[]
  onAdd: (pricing: PricingDto) => void
  onRemove: (pricing: PricingDto) => void
}

export default function GroupedIncludedFeesForm({
  disabled,
  defaultFees,
  onAdd,
  onRemove,
}: GroupedIncludedFeesFormProps) {
  const [fees, setFees] = useState(defaultFees || [])

  useEffect(() => {
    if (defaultFees) setFees(defaultFees)
  }, [defaultFees])

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [value, setValue] = useInputState('')

  const [debouncedSearch] = useDebouncedValue(value, 300)
  const { data, isLoading } = useQuery({
    ...pricingControllerFindAllOptions({
      query: { search: debouncedSearch !== '' ? debouncedSearch : undefined },
    }),
    enabled: combobox.dropdownOpened,
  })

  const shouldFilterOptions =
    data && !data.pricings.some((item) => item.name === value)
  const filteredOptions = (
    shouldFilterOptions
      ? data.pricings.filter((item) =>
          item.name.toLowerCase().includes(value.toLowerCase().trim()),
        )
      : data?.pricings
  )?.filter((item) => !fees.some((fee) => fee.id === item.id))

  useEffect(() => {
    combobox.selectFirstOption()
  }, [value])

  return (
    <Stack>
      <Combobox
        onOptionSubmit={(optionValue) => {
          if (data) {
            const found = data.pricings.find(
              (price) => price.id === optionValue,
            )

            if (found) {
              setFees((prev) => [...prev, found])
              onAdd(found)
            }
          }
          setValue('')
          combobox.closeDropdown()
        }}
        store={combobox}
      >
        <Combobox.Target>
          <TextInput
            label="Included Fees"
            placeholder="Search"
            leftSection={<IconSearch size={18} stroke={1} />}
            value={value}
            onChange={(event) => {
              setValue(event)
              combobox.openDropdown()
              combobox.updateSelectedOptionIndex()
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            flex={1}
            disabled={disabled}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {isLoading ? (
              <Combobox.Empty>Fetching...</Combobox.Empty>
            ) : filteredOptions?.length === 0 ? (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            ) : (
              filteredOptions?.map((pricing) => (
                <Combobox.Option value={pricing.id} key={pricing.id}>
                  <Group justify="space-between">
                    <Text>{pricing.name}</Text>
                    <Text>₱{pricing.amount}</Text>
                  </Group>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Stack gap="xs">
        {fees.map((fee) => (
          <Group key={fee.id}>
            <Card radius="md" py={8} withBorder flex={1}>
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="sm">{fee.name}</Text>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {fee.type}
                  </Text>
                </Stack>
                <Text size="sm">₱{fee.amount}</Text>
              </Group>
            </Card>
            <ActionIcon
              size="sm"
              variant="outline"
              radius="lg"
              onClick={() => {
                onRemove(fee)
                setFees((prev) => prev.filter((item) => item.id !== fee.id))
              }}
              disabled={disabled}
            >
              <IconMinus />
            </ActionIcon>
          </Group>
        ))}
        <Divider />
        <Group mr={36}>
          <Card radius="md" py={8} flex={1}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Total
              </Text>

              <Text size="sm" fw={500}>
                ₱
                {fees
                  .reduce(
                    (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
                    new Decimal(0),
                  )
                  .toString()}
              </Text>
            </Group>
          </Card>
        </Group>
      </Stack>
    </Stack>
  )
}
