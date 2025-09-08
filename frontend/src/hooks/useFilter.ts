import { type FilterType } from '@/components/multi-filter.tsx'
import { useCallback, useMemo, useState } from 'react'

export type FilterConfig<T> = {
  [key: string]: (item: T, value: string) => boolean
}

export function useFilter<T>(
  defaultFilters: FilterType[],
  data: T[] = [],
  customFilterConfig: FilterConfig<T>,
) {
  const [activeFilters, setActiveFilters] =
    useState<FilterType[]>(defaultFilters)

  const handleAddFilter = useCallback(
    (filterType: Omit<FilterType, 'value' | 'id'>) => {
      setActiveFilters((prevFilters) => [
        ...prevFilters,
        {
          ...filterType,
          value: '',
          id: Math.random().toString(36).slice(2, 9),
        },
      ])
    },
    [],
  )

  const handleRemoveFilter = useCallback((id: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.filter((filter) => filter.id !== id),
    )
  }, [])

  const handleFilterChange = useCallback((id: string, value: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.id === id ? { ...filter, value } : filter,
      ),
    )
  }, [])

  const filteredData = useMemo(() => {
    if (!data.length) return data

    return data.filter((item) => {
      return activeFilters.every((filter) => {
        // Skip filters without values
        if (!filter.value) return true

        // Type-safe access to filter function
        const filterFunction =
          filter.label in customFilterConfig
            ? customFilterConfig[filter.label]
            : null

        if (!filterFunction) {
          console.warn(`No filter function found for: ${filter.label}`)
          return true
        }

        return filterFunction(item, filter.value)
      })
    })
  }, [data, activeFilters, customFilterConfig])

  const activeFilterCount = useMemo(() => {
    return activeFilters.filter((filter) => filter.value).length
  }, [activeFilters])

  return {
    activeFilters,
    activeFilterCount,
    filteredData,
    handleAddFilter,
    handleRemoveFilter,
    handleFilterChange,
  }
}
