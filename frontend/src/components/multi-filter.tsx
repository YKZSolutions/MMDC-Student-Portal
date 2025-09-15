import React, { type ReactNode, useEffect, useState } from 'react'
import { Button, Group, Menu, Stack, Text, TextInput } from '@mantine/core'
import {
  IconCalendar,
  IconChevronDown,
  IconCircleCheck,
  IconHash,
  IconPlus,
  IconTag,
  IconUser,
  IconX,
} from '@tabler/icons-react'

// Main filter container component

type MultiFiltersProps = {
  filters: FilterType[]
  activeFilters: FilterPillProps[]
  onAddFilter: (filterType: FilterType) => void
}

const MultiFilter = ({
  filters,
  activeFilters,
  onAddFilter,
}: MultiFiltersProps) => {
  return (
    <Group align={'center'} gap={2} p={'sm'}>
      {activeFilters.map((filter: FilterPillProps) => (
        <FilterPill key={filter.id} {...filter} />
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
  id: string
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

  useEffect(() => {
    setSelectedValue(value || '')
  }, [value])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange?.(newValue)
  }

  const renderFilterContent = () => {
    switch (type) {
      case 'select':
        return (
          <>
            <Menu.Label>Select an option</Menu.Label>
            {options?.map((option) => (
              <Menu.Item
                key={option.value}
                bg={selectedValue === option.value ? 'blue.0' : ''}
                color={selectedValue === option.value ? 'blue.6' : ''}
                onClick={() => {
                  handleValueChange(option.value)
                  setIsOpen(false)
                }}
                rightSection={
                  selectedValue === option.value && (
                    <IconCircleCheck size={14} />
                  )
                }
              >
                {option.label}
              </Menu.Item>
            ))}
          </>
        )

      case 'text':
        return (
          <>
            <Menu.Label>Enter text</Menu.Label>
            <Stack gap={'xs'} p={'sm'}>
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
          </>
        )

      case 'date':
        return (
          <>
            <Menu.Label>Date condition</Menu.Label>
            {[
              'Today',
              'Yesterday',
              'This week',
              'Last week',
              'This month',
              'Last month',
            ].map((option) => (
              <Menu.Item
                key={option}
                bg={selectedValue === option ? 'blue.0' : ''}
                color={selectedValue === option ? 'blue.6' : ''}
                onClick={() => {
                  handleValueChange(option)
                  setIsOpen(false)
                }}
                rightSection={
                  selectedValue === option && <IconCircleCheck size={14} />
                }
              >
                {option}
              </Menu.Item>
            ))}
          </>
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
    <Menu shadow={'md'} width={'fit-content'} position={'bottom-start'}>
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
  id: string
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

  const filterTypes: FilterType[] = [
    {
      id: '',
      label: 'Status',
      icon: <IconCircleCheck size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Not started', value: 'not-started' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Done', value: 'done' },
      ],
    },
    {
      id: '',
      label: 'Assigned to',
      icon: <IconUser size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'John Doe', value: 'john' },
        { label: 'Jane Smith', value: 'jane' },
        { label: 'Bob Johnson', value: 'bob' },
      ],
    },
    {
      id: '',
      label: 'Tags',
      icon: <IconTag size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Important', value: 'important' },
        { label: 'Urgent', value: 'urgent' },
        { label: 'Low priority', value: 'low' },
      ],
    },
    {
      id: '',
      label: 'Created',
      icon: <IconCalendar size={16} />,
      type: 'date',
      value: '',
      options: [],
    },
    {
      id: '',
      label: 'Name',
      icon: <IconHash size={16} />,
      type: 'text',
      value: '',
      options: [],
    },
  ]

  // filters.push(...filterTypes)

  return (
    <Menu
      shadow={'md'}
      width={'fit-content'}
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
        <Menu.Label>Add a Filter</Menu.Label>
        {filters.map((filterType: FilterType) => (
          <Menu.Item
            key={filterType.label}
            onClick={() => {
              setIsOpen(false)
              onAddFilter(filterType)
            }}
            leftSection={filterType.icon}
          >
            {filterType.label}
          </Menu.Item>
        ))}
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
