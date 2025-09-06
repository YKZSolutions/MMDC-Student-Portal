import React, { type ReactNode, useState } from 'react'
import { Button, Group, Menu, Stack, Text, TextInput } from '@mantine/core'
import {
  IconChevronDown,
  IconCircleCheck,
  IconPlus,
  IconX,
} from '@tabler/icons-react'

// Main filter container component

type MultiFiltersProps = {
  filters: FilterType[]
  activeFilters: FilterPillProps[]
  onAddFilter: (filterType: FilterType) => void
  onRemoveFilter: (index: number) => void
}

const MultiFilter = ({
  filters,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
}: MultiFiltersProps) => {
  return (
    <Group align={'center'} gap={2} p={'sm'}>
      {activeFilters.map((filter: FilterPillProps, index) => (
        <FilterPill
          key={index}
          {...filter}
          onRemove={() => onRemoveFilter(index)}
        />
      ))}
      <AddFilterButton filters={filters} onAddFilter={onAddFilter} />
    </Group>
  )
}

type FilterInputType = 'select' | 'text' | 'date'

type FilterOption = {
  label: string
  value: string
}

type FilterPillProps = {
  label: string
  icon: ReactNode
  type: FilterInputType
  value: string
  options: FilterOption[]
  onRemove?: () => void
  onChange: (value: string) => void
}

// Individual filter pill component
const FilterPill = ({
  label,
  icon,
  type,
  value,
  options,
  onRemove,
  onChange,
}: FilterPillProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const renderFilterContent = () => {
    switch (type) {
      case 'select':
        return (
          <Stack p={'sm'} gap={'xs'}>
            <Text size={'xs'} c={'gray'} mb={'2'}>
              Select an option
            </Text>
            {options?.map((option) => (
              <Button
                key={option.value}
                component={Group}
                variant={'subtle'}
                bg={selectedValue === option.value ? 'blue.0' : ''}
                color={selectedValue === option.value ? 'blue.6' : 'dark.4'}
                onClick={() => {
                  handleValueChange(option.value)
                  setIsOpen(false)
                }}
                rightSection={
                  selectedValue === option.value && (
                    <IconCircleCheck size={14} />
                  )
                }
                justify={'space-between'}
                align={'center'}
                fw={400}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        )

      case 'text':
        return (
          <Stack p={'sm'} gap={'xs'}>
            <Text size={'xs'} c={'gray'} mb={'2'}>
              Enter text
            </Text>
            <TextInput
              value={selectedValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Type here..."
              autoFocus
            />
            <Stack align={'end'} mt={'2'}>
              <Button onClick={() => setIsOpen(false)} size={'xs'}>
                Done
              </Button>
            </Stack>
          </Stack>
        )

      case 'date':
        return (
          <Stack p={'sm'} gap={'xs'}>
            <Text size={'xs'} c={'gray'} mb={'2'}>
              Date condition
            </Text>
            {[
              'Today',
              'Yesterday',
              'This week',
              'Last week',
              'This month',
              'Last month',
            ].map((option) => (
              <Button
                key={option}
                component={Group}
                variant={'subtle'}
                bg={selectedValue === option ? 'blue.0' : ''}
                color={selectedValue === option ? 'blue.6' : ''}
                onClick={() => {
                  handleValueChange(option)
                  setIsOpen(false)
                }}
                rightSection={
                  selectedValue === option && <IconCircleCheck size={14} />
                }
                justify={'space-between'}
                align={'center'}
                fw={400}
              >
                {option}
              </Button>
            ))}
          </Stack>
        )

      default:
        return (
          <div className="p-3 text-sm text-gray-500">
            Configure filter options
          </div>
        )
    }
  }

  return (
    <Menu
      shadow={'md'}
      width={'fit-content'}
      withinPortal
      position={'bottom-start'}
    >
      <Menu.Target>
        <Button
          variant={'outline'}
          radius={'md'}
          c={'gray.7'}
          color={'gray.4'}
          onClick={() => setIsOpen(!isOpen)}
          leftSection={icon}
          rightSection={
            <div
              color={'gray.6'}
              className={`transition-opacity ${isOpen ? 'opacity-0' : 'opacity-0 hover:opacity-100'}`}
            >
              <IconX
                size={14}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove!()
                }}
              />
            </div>
          }
        >
          <Group gap={4}>
            <Text c={'gray.7'} fw={500} fz={'sm'}>
              {label}
            </Text>
            {selectedValue && (
              <>
                <Text fz={'sm'} fw={500} c={'gray.5'}>
                  is
                </Text>
                <Text fz={'sm'} fw={500} c={'gray.9'}>
                  {type === 'select'
                    ? options?.find((opt) => opt.value === selectedValue)
                        ?.label || selectedValue
                    : selectedValue}
                </Text>
              </>
            )}
            <IconChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>{renderFilterContent()}</Menu.Dropdown>
    </Menu>
  )
}

type FilterType = {
  label: string
  icon: ReactNode
  type: FilterInputType
  options: { label: string; value: string }[]
  value: string
}

type AddFilterButtonProps = {
  filters: FilterType[]
  onAddFilter: (filterType: FilterType) => void
}

// Add filter button component
const AddFilterButton = ({ filters, onAddFilter }: AddFilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // const filterTypes: FilterType[] = [
  //   {
  //     label: 'Status',
  //     icon: <IconCircleCheck size={16} />,
  //     type: 'select',
  //     options: [
  //       { label: 'Not started', value: 'not-started' },
  //       { label: 'In progress', value: 'in-progress' },
  //       { label: 'Done', value: 'done' },
  //     ],
  //   },
  //   {
  //     label: 'Assigned to',
  //     icon: <IconUser size={16} />,
  //     type: 'select',
  //     options: [
  //       { label: 'John Doe', value: 'john' },
  //       { label: 'Jane Smith', value: 'jane' },
  //       { label: 'Bob Johnson', value: 'bob' },
  //     ],
  //   },
  //   {
  //     label: 'Tags',
  //     icon: <IconTag size={16} />,
  //     type: 'select',
  //     options: [
  //       { label: 'Important', value: 'important' },
  //       { label: 'Urgent', value: 'urgent' },
  //       { label: 'Low priority', value: 'low' },
  //     ],
  //   },
  //   {
  //     label: 'Created',
  //     icon: <IconCalendar size={16} />,
  //     type: 'date',
  //   },
  //   {
  //     label: 'Name',
  //     icon: <IconHash size={16} />,
  //     type: 'text',
  //   },
  // ]

  return (
    <Menu
      shadow={'md'}
      width={'fit-content'}
      withinPortal
      position={'bottom-start'}
      opened={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Menu.Target>
        <Button
          variant={'outline'}
          radius={'md'}
          c={'gray.7'}
          color={'gray.4'}
          onClick={() => setIsOpen(!isOpen)}
          leftSection={<IconPlus size={14} />}
        >
          Filter
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Stack p={'sm'} gap={'xs'}>
          <Text size={'xs'} c={'gray'} mb={'2'}>
            Add a filter
          </Text>
          {filters.map((filterType: FilterType) => (
            <Button
              key={filterType.label}
              component={Group}
              variant={'subtle'}
              radius={'md'}
              c={'gray.7'}
              justify={'start'}
              align={'center'}
              onClick={() => {
                setIsOpen(false)
                onAddFilter(filterType)
              }}
              leftSection={filterType.icon}
            >
              {filterType.label}
            </Button>
          ))}
        </Stack>
      </Menu.Dropdown>
    </Menu>
  )
}

export {
  MultiFilter,
  FilterPill,
  type FilterType,
  type FilterPillProps,
  type FilterInputType,
}
