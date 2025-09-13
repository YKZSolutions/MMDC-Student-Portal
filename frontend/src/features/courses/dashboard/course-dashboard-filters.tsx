import { type FilterType, MultiFilter } from '@/components/multi-filter.tsx'
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
    <MultiFilter
      filters={filters}
      activeFilters={transformedFilters}
      onAddFilter={onAddFilter}
    />
  )
}

export default CourseDashboardFilters
