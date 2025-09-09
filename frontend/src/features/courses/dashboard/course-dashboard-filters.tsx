import { type FilterType, MultiFilter } from '@/components/multi-filter.tsx'
import { Group } from '@mantine/core'
import { useMemo } from 'react'

type CourseDashboardFiltersProps = {
  filters: FilterType[]
  activeFilters: FilterType[]
  onAddFilter: (filterType: FilterType) => void
  onRemoveFilter: (id: string) => void
  onFilterChange: (id: string, value: string) => void
}

const CourseDashboardFilters = ({
  filters,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
}: CourseDashboardFiltersProps) => {
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
    <Group gap={'md'} align="start">
      <MultiFilter
        filters={filters}
        activeFilters={transformedFilters}
        onAddFilter={onAddFilter}
      />
    </Group>
  )
}

export default CourseDashboardFilters
