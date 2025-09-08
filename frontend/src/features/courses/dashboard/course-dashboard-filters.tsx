import { type FilterType, MultiFilter } from '@/components/multi-filter.tsx'
import { Group } from '@mantine/core'

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
  return (
    <Group gap={'md'} align="start">
      <MultiFilter
        filters={filters}
        activeFilters={activeFilters.map((filter) => ({
          ...filter,
          onChange: (value: string) => onFilterChange(filter.id, value),
          onRemove: () => onRemoveFilter(filter.id),
        }))}
        onAddFilter={onAddFilter}
      />
    </Group>
  )
}

export default CourseDashboardFilters
