import { type ReactNode } from 'react'
import {
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconFilter2,
  IconLayoutGridFilled,
  IconList,
} from '@tabler/icons-react'
import type { FilterType } from '@/components/multi-filter.tsx'
import CourseDashboardFilters from '@/features/courses/dashboard/course-dashboard-filters.tsx'
import SearchComponent from '@/components/search-component.tsx'

type DashboardHeaderProps = {
  coursesData: any
  filters: FilterType[]
  activeFilters: FilterType[]
  onSearchFilter: (courses: any) => void
  handleAddFilter: (filterType: FilterType) => void
  handleRemoveFilter: (id: string) => void
  handleFilterChange: (id: string, value: string) => void
  showFilters: boolean
  onToggleShowFilter: (show: boolean) => void
  activeFilterCount: number
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

const CourseDashboardHeader = ({
  coursesData,
  filters,
  activeFilters,
  onSearchFilter,
  handleAddFilter,
  handleRemoveFilter,
  handleFilterChange,
  showFilters,
  onToggleShowFilter,
  activeFilterCount,
  view,
  onViewChange,
}: DashboardHeaderProps) => (
  <Stack gap="xs">
    <Group justify="space-between" align="center">
      <Title c="dark.7" variant="hero" order={2} fw={700}>
        Courses
      </Title>
      <Group justify="space-between" align="center">
        <SearchComponent
          data={coursesData}
          onFilter={onSearchFilter}
          identifiers={['courseName']}
          placeholder="Search courses"
        />
        <Group>
          <ViewSelectorButton
            view={view}
            onGridClick={() => onViewChange('grid')}
            onListClick={() => onViewChange('list')}
          />
          <FilterButton
            showFilters={showFilters}
            filterCount={activeFilterCount}
            onClick={() => onToggleShowFilter(!showFilters)}
          />
        </Group>
      </Group>
    </Group>
    <Box hidden={!showFilters}>
      <CourseDashboardFilters
        filters={filters}
        activeFilters={activeFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onFilterChange={handleFilterChange}
      />
    </Box>
    <Divider />
  </Stack>
)

type FilterButtonProps = {
  showFilters: boolean
  filterCount: number
  onClick: () => void
}

const FilterButton = ({
  showFilters,
  filterCount,
  onClick,
}: FilterButtonProps) => (
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

type SelectorButtonProps = {
  active: boolean
  icon: ReactNode
  onClick: () => void
}
const SelectorButton = ({ active, icon, onClick }: SelectorButtonProps) => (
  <Button
    variant="default"
    radius={'md'}
    bg={active ? 'gray.3' : 'gray.0'}
    size={'xs'}
    onClick={onClick}
  >
    <div color={active ? 'black' : 'dark.2'}>{icon}</div>
  </Button>
)

type ViewSelectorButtonProps = {
  view: 'grid' | 'list'
  onGridClick: () => void
  onListClick: () => void
}

const ViewSelectorButton = ({
  view,
  onGridClick,
  onListClick,
}: ViewSelectorButtonProps) => (
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

export default CourseDashboardHeader
