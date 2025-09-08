// Course-specific filter configuration
import { type FilterConfig, useFilter } from '@/hooks/useFilter.ts'
import type {
  AcademicProgram,
  AcademicTerm,
  Course,
  EnrolledCourse,
} from '@/features/courses/types.ts'
import { createFilterOption, formatTerm } from '@/utils/helpers.ts'
import { Component, type ReactNode, useState } from 'react'
import type { FilterInputType, FilterType } from '@/components/multi-filter.tsx'
import { useCurrentMeeting } from '@/features/courses/hooks/useCurrentMeeting.ts'
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core'
import SearchComponent from '@/components/search-component'
import CourseDashboardFilters from '@/features/courses/dashboard/course-dashboard-filters.tsx'
import {
  IconCalendarTime,
  IconFilter2,
  IconLayoutGridFilled,
  IconList,
  IconUserCode,
} from '@tabler/icons-react'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item.tsx'
import type { Role } from '@/integrations/api/client'

const courseFilterConfig: FilterConfig<Course | EnrolledCourse> = {
  Program: (course, value) => {
    if ('programs' in course) {
      // Course
      const programCodes = course.programs.map((program) => program.programCode)
      return programCodes.map((code) => code.toLowerCase()).includes(value)
    }
    return false
  },

  Term: (course: EnrolledCourse | Course, value: string) => {
    if ('academicTerm' in course) {
      // Handle EnrolledCourse case
      if (value === 'current' && course.academicTerm.isCurrent) return true
      return (
        formatTerm(course.academicTerm).toLowerCase() === value.toLowerCase()
      )
    } else {
      // Handle Course case
      if (value === 'current') {
        return course.academicTerms.some((term) => term.isCurrent)
      }
      return course.academicTerms.some(
        (term) => formatTerm(term).toLowerCase() === value.toLowerCase(),
      )
    }
  },

  Schedule: (course: Course | EnrolledCourse, value: string) => {
    if ('section' in course) {
      return course.section.sectionSchedule.day
        .toLowerCase()
        .includes(value.toLowerCase())
    }
    return false
  },
}

type CourseDashboardProps = {
  role: Role
  academicTerms: AcademicTerm[]
  academicPrograms: AcademicProgram[]
  coursesData: Course[] | EnrolledCourse[]
}

const CourseDashboard = ({
  role,
  academicTerms,
  academicPrograms,
  coursesData,
}: CourseDashboardProps) => {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  //TODO: implement API call to get courses, get it by academic term Id
  const [searchFilteredCourses, setSearchFilteredCourses] =
    useState<(Course | EnrolledCourse)[]>(coursesData)

  const filters: FilterType[] = [
    {
      id: '',
      label: 'Term',
      icon: <IconCalendarTime size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Current', value: 'current' },
        ...(role === 'student'
          ? coursesData.map((course) =>
              'academicTerm' in course
                ? createFilterOption(formatTerm(course.academicTerm))
                : { label: '', value: '' },
            )
          : academicTerms.map((term) => createFilterOption(formatTerm(term)))),
      ],
    },
    ...(role !== 'student'
      ? [
          {
            id: '',
            label: 'Program',
            icon: <IconUserCode size={16} />,
            type: 'select' as FilterInputType,
            value: '',
            options: [
              ...academicPrograms.map((program) =>
                createFilterOption(program.programCode),
              ),
            ],
          },
        ]
      : []),
  ]

  const defaultFilters: FilterType[] = [
    {
      ...filters[0],
      value: 'current',
    },
  ]

  const [showFilters, setShowFilters] = useState(true)

  const {
    activeFilters,
    filteredData,
    activeFilterCount,
    handleAddFilter,
    handleRemoveFilter,
    handleFilterChange,
  } = useFilter(defaultFilters, searchFilteredCourses, courseFilterConfig)

  return (
    <Container size={'lg'} w={'100%'} pb={'xl'}>
      <Stack gap={'lg'}>
        <Header
          coursesData={coursesData}
          onSearchFilter={setSearchFilteredCourses}
          filters={filters}
          activeFilters={activeFilters}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleFilterChange={handleFilterChange}
          showFilters={showFilters}
          onToggleShowFilter={setShowFilters}
          activeFilterCount={activeFilterCount}
          view={view}
          onViewChange={setView}
        />
        <Group wrap={'wrap-reverse'} align="start" gap={'md'} w={'100%'}>
          {/*Courses*/}
          <Group
            wrap="wrap"
            gap={'md'}
            style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
          >
            {filteredData.map((course, index) =>
              view === 'grid' ? (
                <CourseCard
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={
                    useCurrentMeeting(course as EnrolledCourse).currentMeeting
                  }
                />
              ) : (
                <CourseListRow
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={
                    useCurrentMeeting(course as EnrolledCourse).currentMeeting
                  }
                />
              ),
            )}
          </Group>
          {/*Upcoming Tasks*/}
          {role === 'student' && (
            <div
              className={'self-end'}
              style={{ flexGrow: 1, flexBasis: '20%', minWidth: 250 }}
            >
              <CourseTasksSummary
                courses={filteredData as unknown as EnrolledCourse[]}
              />
            </div>
          )}
        </Group>
      </Stack>
    </Container>
  )
}

type HeaderProps = {
  coursesData: any
  onSearchFilter: (courses: Course[] | EnrolledCourse[]) => void
  filters: FilterType[]
  activeFilters: FilterType[]
  handleAddFilter: (filterType: FilterType) => void
  handleRemoveFilter: (id: string) => void
  handleFilterChange: (id: string, value: string) => void
  showFilters: boolean
  onToggleShowFilter: (show: boolean) => void
  activeFilterCount: number
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

const Header = ({
  coursesData,
  onSearchFilter,
  filters,
  activeFilters,
  handleAddFilter,
  handleRemoveFilter,
  handleFilterChange,
  showFilters,
  onToggleShowFilter,
  activeFilterCount,
  view,
  onViewChange,
}: HeaderProps) => {
  return (
    <Stack gap={'xs'}>
      <Group justify="space-between" align="center">
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Courses
        </Title>
        {/*Filters*/}
        <Group justify="space-between" align="center">
          <SearchComponent //TODO: might need to replace this later if paging should be implemented
            data={coursesData}
            onFilter={onSearchFilter}
            identifiers={['courseName']}
            placeholder={'Search courses'}
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
}

class FilterButton extends Component<{
  showFilters: boolean
  filterCount: number
  onClick: () => void
}> {
  render() {
    return (
      <Tooltip label={this.props.showFilters ? 'Hide Filters' : 'Show Filters'}>
        <Button
          variant={'subtle'}
          c={
            this.props.filterCount !== 0 || this.props.showFilters
              ? 'blue.6'
              : 'gray.6'
          }
          onClick={this.props.onClick}
          leftSection={<IconFilter2 size={20} />}
        >
          Filters
        </Button>
      </Tooltip>
    )
  }
}

class SelectorButton extends Component<{
  active: boolean
  icon: ReactNode
  onClick: () => void
}> {
  render() {
    return (
      <Button
        variant="default"
        radius={'md'}
        bg={this.props.active ? 'gray.3' : 'gray.0'}
        size={'xs'}
        onClick={this.props.onClick}
      >
        <div color={this.props.active ? 'black' : 'dark.2'}>
          {this.props.icon}
        </div>
      </Button>
    )
  }
}

class ViewSelectorButton extends Component<{
  view: 'grid' | 'list'
  onGridClick: () => void
  onListClick: () => void
}> {
  render() {
    return (
      <Button.Group>
        <SelectorButton
          active={this.props.view === 'grid'}
          onClick={this.props.onGridClick}
          icon={<IconLayoutGridFilled size={20} />}
        />
        <SelectorButton
          active={this.props.view === 'list'}
          onClick={this.props.onListClick}
          icon={<IconList size={20} />}
        />
      </Button.Group>
    )
  }
}

export default CourseDashboard
