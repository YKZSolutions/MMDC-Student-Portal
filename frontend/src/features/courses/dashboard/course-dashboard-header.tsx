import type { FilterType } from '@/components/multi-filter.tsx'
import SearchComponent from '@/components/search-component.tsx'
import CourseDashboardFilters from '@/features/courses/dashboard/course-dashboard-filters.tsx'
import {
  Box,
  Button,
  Divider,
  Group,
  rem,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconFilter2,
  IconLayoutGridFilled,
  IconList,
} from '@tabler/icons-react'
import { type ReactNode } from 'react'

type DashboardHeaderProps = {
  coursesData: any
  filters: FilterType[]
  activeFilters: FilterType[]
  onSearchFilter: (courses: any) => void
  handleAddFilter: (filterType: FilterType) => void
  handleRemoveFilter: (id: string) => void
  handleFilterChange: (id: string, value: string) => void
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
  view,
  onViewChange,
}: DashboardHeaderProps) => (
  <Stack gap="xs">
    <Group justify="space-between" align="center">
      <Title c="dark.7" variant="hero" order={2} fw={700}>
        Courses
      </Title>
      <Group align="center" gap={rem(5)}>
        <SearchComponent
          data={coursesData}
          onFilter={onSearchFilter}
          identifiers={['courseName']}
          placeholder="Search courses"
        />
        <CourseDashboardFilters
          filters={filters}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        />
        <ViewSelectorButton
          view={view}
          onGridClick={() => onViewChange('grid')}
          onListClick={() => onViewChange('list')}
        />
      </Group>
    </Group>
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
    onClick={onClick}
  >
    <Box color={active ? 'black' : 'dark.2'}>{icon}</Box>
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
