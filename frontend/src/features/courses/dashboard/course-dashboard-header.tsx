import { MultiFilter, type FilterType } from '@/components/multi-filter.tsx'
import {
  Box,
  Button,
  Divider,
  Group,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconFilter2,
  IconLayoutGridFilled,
  IconList,
  IconSearch,
} from '@tabler/icons-react'
import { useMemo, type ReactNode } from 'react'

type DashboardHeaderProps = {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

function CourseDashboardHeader({ view, onViewChange }: DashboardHeaderProps) {
  return (
    <Stack gap="md">
      <Box>
        <Title c="dark.7" variant="hero" order={2} fw={700}>
          Courses
        </Title>
        <Text fw={500} c="dark.3" fz="md">
          {/* Create a subtitle here */}
          Browse and manage your courses
        </Text>
      </Box>
      <Group align="center" justify="end" gap={rem(5)}>
        <TextInput
          placeholder="Search name/email"
          radius={'md'}
          leftSection={<IconSearch size={18} stroke={1} />}
          w={{
            base: '100%',
            xs: rem(250),
          }}
        />
        {/* Implement this at a later time */}
        {/* <CourseDashboardFilters
          filters={filters}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        /> */}
        <ViewSelectorButton
          view={view}
          onGridClick={() => onViewChange('grid')}
          onListClick={() => onViewChange('list')}
        />
      </Group>
      <Divider />
    </Stack>
  )
}

type CourseDashboardFiltersProps = {
  filters: FilterType[]
  activeFilters: FilterType[]
  onAddFilter: (filterType: FilterType) => void
  onRemoveFilter: (id: string) => void
  onFilterChange: (id: string, value: string) => void
}

function CourseDashboardFilters({
  filters,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
}: CourseDashboardFiltersProps) {
  const transformedFilters = useMemo(
    () =>
      activeFilters.map((filter) => ({
        ...filter,
        onChange: (value: string) => onFilterChange(filter.id, value),
        onRemove: () => onRemoveFilter(filter.id),
      })),
    [activeFilters, onAddFilter, onFilterChange, onRemoveFilter],
  )

  return (
    <MultiFilter
      filters={filters}
      activeFilters={transformedFilters}
      onAddFilter={onAddFilter}
    />
  )
}

type FilterButtonProps = {
  showFilters: boolean
  filterCount: number
  onClick: () => void
}

function FilterButton({
  showFilters,
  filterCount,
  onClick,
}: FilterButtonProps) {
  return (
    <Tooltip label={showFilters ? 'Hide Filters' : 'Show Filters'}>
      <Button
        variant={'subtle'}
        c={filterCount !== 0 || showFilters ? 'blue.6' : 'gray.6'}
        onClick={onClick}
        leftSection={<IconFilter2 size={20} />}
      >
        Filters
      </Button>
    </Tooltip>
  )
}

type SelectorButtonProps = {
  active: boolean
  icon: ReactNode
  onClick: () => void
}

function SelectorButton({ active, icon, onClick }: SelectorButtonProps) {
  return (
    <Button
      variant="default"
      radius={'md'}
      bg={active ? 'gray.3' : 'gray.0'}
      onClick={onClick}
    >
      <Box color={active ? 'black' : 'dark.2'}>{icon}</Box>
    </Button>
  )
}

type ViewSelectorButtonProps = {
  view: 'grid' | 'list'
  onGridClick: () => void
  onListClick: () => void
}

function ViewSelectorButton({
  view,
  onGridClick,
  onListClick,
}: ViewSelectorButtonProps) {
  return (
    <Button.Group>
      <SelectorButton
        active={view === 'grid'}
        onClick={onGridClick}
        icon={<IconLayoutGridFilled size={20} />}
      />
      <SelectorButton
        active={view === 'list'}
        onClick={onListClick}
        icon={<IconList size={20} />}
      />
    </Button.Group>
  )
}

export default CourseDashboardHeader
